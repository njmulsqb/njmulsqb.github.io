$(function () {

    "use strict";

   //===== Prealoder
   $(window).load(function() {
    $("#loading").fadeOut(500);
});

//header-scroll
    let areaHeight = $('[data-scroll-area="true"]').height();
    $('.hero-scrolli').on('click', function(e){
        let target = $(this).attr('href');
        if (target && target.startsWith('#')) {
            e.preventDefault();
            $('html, body').animate({
                scrollTop: $(target).offset().top - 80 // offset for sticky header
            }, 1000);
        } else {
            $('html').animate({
                scrollTop: areaHeight
            }, 1000);
        }
    });

//scroll-to-top
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 600 && ($(window).scrollTop() + $(window).height() < $(document).height() - 50)) {        
            $('.scroll-to-top').fadeIn(200);    
        } else {
            $('.scroll-to-top').fadeOut(200);   
        }
    }).trigger('scroll');

    $('.scroll-to-top').on('click', function(){
        $('html').animate({
            scrollTop: 0
        }, 1000);
    });
//mobile-menu
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileSidebar = document.getElementById('mobile-sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const body = document.body;

    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            mobileSidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            body.style.overflow = 'hidden';
        });
    }

    function hideSidebar() {
        mobileSidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        body.style.overflow = '';
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', hideSidebar);
    }

    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', hideSidebar);
    }

    // Close sidebar when clicking a link
    $('.mobile-nav a').on('click', function() {
        hideSidebar();
    });

//one page nav
if ($('.main-menu ul').length) {
    $('.main-menu ul').onePageNav({
        currentClass: 'current',
        changeHash: false,
        scrollSpeed: 750,
        scrollThreshold: 0.5,
        filter: '',
        easing: 'swing'
    });
}




    //===== Sticky header simple logic
    $(window).on('scroll', function (event) {
        var scroll = $(window).scrollTop();
        if (scroll < 10) {
            $(".bottom-header-area").removeClass("sticky");
        } else {
            $(".bottom-header-area").addClass("sticky");
        }
    });





    //===== hero Active slick slider
    $('.hero-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
        arrows: false,
        prevArrow: '<span class="prev"><i class="fal fa-long-arrow-alt-left"></i></span>',
        nextArrow: '<span class="next"><i class="fal fa-long-arrow-alt-right"></i></span>',
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });



    //===== textimonial-carousel-active
    $('.textimonial-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,
        prevArrow: '<span class="prev"><i class="fa fa-angle-left"></i></i></span>',
        nextArrow: '<span class="next"><i class="fa fa-angle-right"></i></i></span>',
        speed: 1500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });



    //===== team-carousel-active
    $('.team-carousel-active').slick({
        dots: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        prevArrow: '<span class="prev"><i class="fa fa-angle-left"></i></i></span>',
        nextArrow: '<span class="next"><i class="fa fa-angle-right"></i></i></span>',
        speed: 1500,
        slidesToShow: 3,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1201,
                settings: {
                    slidesToShow: 3,
                }
        },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                }
        },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                }
        },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                }
        }
        ]
    });

    //===== counter up
    $('.count').counterUp({
        delay: 10,
        time: 2000
    });


    //====== Magnific Popup

    $('.video-popup').magnificPopup({
        type: 'iframe',
        // other options
    });



    //===== Magnific Popup
    $('.img-popup').magnificPopup({
        type: 'image',
        gallery: {
            enabled: true
        }
    });


    var sjs = SimpleJekyllSearch({
      searchInput: document.getElementById('search-input'),
      resultsContainer: document.getElementById('results-container'),
      json: '/search.json',
      searchResultTemplate: '<li><a href="{url}">- {title}</a></li>',
      noResultsText: '<li>No results found</li>',
      success: function() {
        updateResultCount();
      }
    });

    // Function to update result count and scroll to top
    function updateResultCount() {
      const resultsContainer = document.getElementById('results-container');
      const resultsCount = document.getElementById('results-count');
      const searchInput = document.getElementById('search-input');
      const resultsWrapper = document.querySelector('.search-results-wrapper');
      
      if (resultsContainer && resultsCount) {
        const items = resultsContainer.querySelectorAll('li');
        const count = items.length;
        
        if (searchInput.value.trim() === '') {
          resultsCount.textContent = '';
        } else if (count === 1 && items[0].textContent === 'No results found') {
          resultsCount.textContent = '(0 found)';
        } else {
          resultsCount.textContent = `(${count} found)`;
        }

        // Always scroll back to top when results change
        if (resultsWrapper) {
            resultsWrapper.scrollTop = 0;
        }
      }
    }

    // Watch for changes in the results container
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      const observer = new MutationObserver(function() {
        updateResultCount();
      });
      
      observer.observe(resultsContainer, {
        childList: true,
        subtree: true
      });
    }

    // Update count when search input changes
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        setTimeout(updateResultCount, 0);
      });
    }

    // Fixing search button for mobile (using delegated event for better support)
    $(document).on('click', '.search-btn', function(e) {
        e.preventDefault();
        $(".offcanvas-search-area").addClass("search-bar-active");
        $("body").addClass("search-active");
        // Focus the input
        setTimeout(() => {
            $('#search-input').focus();
        }, 300);
    });

    $(document).on('click', ".close-bar i, .sidebar-overlay, .close-bar", function(){
        $(".offcanvas-search-area").removeClass("search-bar-active");
        $("body").removeClass("search-active");
    });
});

// Update year

document.addEventListener('DOMContentLoaded', function () {
    const yearSpan = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;
});