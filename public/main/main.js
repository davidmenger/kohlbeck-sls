
import $ from 'jquery';
import 'babel-polyfill';
import './scss/main.scss';

// fix for bootstrap
window.jQuery = $;
window.$ = $;

if (window.devicePixelRatio > 1) {
    $('img.hires').each((i, img) => {
        img.src = img.src.replace(/^(.+)\.([a-z]+)$/, '$1@2x.$2'); // eslint-disable-line no-param-reassign
    });
}

if ($(document.body).hasClass('home')) {
    const $header = $('#header');
    const $topComp = $('.home-background');
    $(document).on('scroll', () => {
        const offset = $(document.body).scrollTop();
        const headerHeight = $topComp.height();

        let opacity = 1;

        if (offset > 0 && offset < headerHeight) {
            opacity = Math.max(0, 1 - (Math.min(offset, 100) / 100));
        } else if (offset >= headerHeight) {
            opacity = 0;
        }

        $header.css({ opacity });
        if (opacity === 0) {
            $header.hide();
        } else {
            $header.show();
        }
    });
}

$('.record-conversion').on('click', function () {
    window.ga('send', 'event', 'Conversion', 'Click', $(this).text(), 1);
});

$('.record-interest').on('click', function () {
    window.ga('send', 'event', 'Interest', 'Click', $(this).text(), 1);
});

function boxSize () {
    let size = null;
    $('.box-size').each((i, el) => {
        const $el = $(el);
        size = size || Math.floor($el.width());
        $el.height(size);
    });
}

$(window).on('resize', boxSize);
boxSize();

let originalHash = null;

function animate ($page, open) {
    if (!$page.length) {
        // console.log('nothing to' + (open ? 'open' : 'close'));
        return;
    }
    // console.log((open ? 'opening' : 'closing'), $page[0]);
    if (open) {
        $page.addClass('open');
        $page.css({ opacity: 1 });
    } else {
        $page.css({ opacity: 0 });
    }
    $page.one(
        'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
        () => {
            if (!open) {
                $page.removeClass('open');
            }
        }
    );
}

function loadPage (hash) {
    // console.log(hash);
    animate($('.popup-page.open'), false);
    if (hash) {
        animate($(`.popup-page-${hash}:not(.open)`), true);
    }
}

function onHashChange () {
    const newHash = window.location.hash;
    // do your stuff based on the comparison of newHash to originalHash
    if (originalHash !== newHash) {
        loadPage(`${newHash}`.replace(/^#/, '') || null);
    }
    originalHash = newHash;
}

$(window).bind('hashchange', onHashChange);
setInterval(onHashChange, 500);
onHashChange();

