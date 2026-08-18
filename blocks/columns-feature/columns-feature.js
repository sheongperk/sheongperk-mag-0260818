function getYoutubeId(url) {
  const usp = new URLSearchParams(url.search);
  if (usp.get('v')) return usp.get('v');
  if (url.origin.includes('youtu.be')) return url.pathname.split('/')[1] || '';
  if (url.pathname.includes('/embed/')) {
    return url.pathname.split('/embed/')[1].split(/[/?]/)[0];
  }
  return '';
}

function embedYoutube(url) {
  const vid = getYoutubeId(url);

  // Facade: show YouTube's poster image (unrestricted) with a play button, and
  // only load the real player on click. This avoids "Error 153" domain-embed
  // restrictions rendering an error box on page load, and improves performance.
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-feature-youtube';
  wrapper.style.cssText = 'left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;';

  if (!vid) {
    // Not a recognisable id — fall back to a plain embed of the given path.
    wrapper.innerHTML = `<iframe src="https://www.youtube.com${url.pathname}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen scrolling="no" title="Content from Youtube" loading="lazy"></iframe>`;
    return wrapper;
  }

  const poster = `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`;
  const posterFallback = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
  wrapper.innerHTML = `
    <button type="button" class="columns-feature-youtube-facade" aria-label="Play video"
      style="position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; border: 0; cursor: pointer; background: #000 center/cover no-repeat url('${poster}');">
      <img src="${poster}" alt="" aria-hidden="true" onerror="this.src='${posterFallback}'"
        style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0;">
      <span class="columns-feature-youtube-play" aria-hidden="true"></span>
    </button>`;

  const openLink = `https://www.youtube.com/watch?v=${vid}`;
  wrapper.querySelector('button').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${vid}?rel=0&autoplay=1&playsinline=1`;
    iframe.style.cssText = 'border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;';
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', 'Content from Youtube');
    // If embedding is domain-restricted (Error 153), fall back to opening the
    // video on YouTube in a new tab so the user is never left with an error box.
    iframe.addEventListener('error', () => window.open(openLink, '_blank', 'noopener'));
    wrapper.textContent = '';
    wrapper.append(iframe);
  });

  return wrapper;
}

function getVideoElement(source, autoplay, background) {
  const video = document.createElement('video');
  video.setAttribute('controls', '');
  if (autoplay) video.setAttribute('autoplay', '');
  if (background) {
    video.setAttribute('loop', '');
    video.setAttribute('playsinline', '');
    video.removeAttribute('controls');
    video.addEventListener('canplay', () => {
      video.muted = true;
      if (autoplay) video.play();
    });
  }

  const sourceEl = document.createElement('source');
  sourceEl.setAttribute('src', source);
  sourceEl.setAttribute('type', 'video/mp4');
  video.append(sourceEl);

  return video;
}

const loadVideoEmbed = (block, link, autoplay, background) => {
  const isYoutube = link.includes('youtube') || link.includes('youtu.be');
  if (isYoutube) {
    const url = new URL(link);
    const embedWrapper = embedYoutube(url);
    block.append(embedWrapper);
    block.dataset.embedLoaded = true;
  } else {
    const videoEl = getVideoElement(link, autoplay, background);
    block.append(videoEl);
    videoEl.addEventListener('canplay', () => {
      block.dataset.embedLoaded = true;
    });
  }
};

function isVideoLink(link) {
  try {
    if (!link) return false;
    const regularVideoCheck = link.match(/\.(mp4|mov|wmv|avi|mkv|webm)$/i) !== null;
    const youtubeCheck = (
      link.includes('youtube.com')
      || link.includes('youtu.be')
      || link.includes('youtube-nocookie.com')
    );
    return regularVideoCheck || youtubeCheck;
  } catch (err) {
    return false;
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-feature-${cols.length}-cols`);

  [...block.children].forEach((row, rowIndex) => {
    row.classList.add('columns-feature-row');
    // Alternate the media/text side on every other row for the feature grid.
    if (rowIndex % 2 === 1) {
      row.classList.add('columns-feature-row-reverse');
    }

    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-feature-img-col');
        }
      }

      const linkavl = col.querySelector('a')?.href;
      const videoBlock = linkavl ? isVideoLink(linkavl) : false;

      if (videoBlock) {
        const videoWrapper = col.closest('div');
        if (videoWrapper) {
          videoWrapper.classList.add('columns-feature-video-col');

          const videoLink = col.querySelector('a');
          if (videoLink) {
            const videoUrl = videoLink.getAttribute('href');

            const videoContainer = document.createElement('div');
            videoContainer.className = 'columns-feature-video-container';

            // Default to a standard click-to-play player (reliable across all
            // videos). Authors can opt into muted background autoplay per cell
            // via data-autoplay / data-background.
            const autoplay = col.dataset.autoplay === 'true';
            const background = col.dataset.background === 'true';

            loadVideoEmbed(
              videoContainer,
              videoUrl,
              autoplay,
              background,
            );

            const buttonContainer = videoLink.closest('div');
            if (buttonContainer) {
              buttonContainer.replaceWith(videoContainer);
            }
          }
        }
      }
    });
  });
}
