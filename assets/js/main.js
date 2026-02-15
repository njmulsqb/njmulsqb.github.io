$(function () {

    "use strict";

   //===== Prealoder
   $(window).load(function() {
    $("#loading").fadeOut(500);
});

//header-scroll
    let areaHeight = $('[data-scroll-area="true"]').height();
    $('.hero-scrolli').on('click', function(){
        $('html').animate({
            scrollTop: areaHeight
        }, 1000);
    });

//scroll-to-top
    $(window).scroll(function() {
        if ($(this).scrollTop() >= 600) {        
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
    $("#mobile-menu").slicknav({
        prependTo: ".mobile-menu-wrap",
        allowParentlinks:true
    });

//one page nav

$('.main-menu nav ul').onePageNav();




    //===== Sticky

    $(window).on('scroll', function (event) {
        var scroll = $(window).scrollTop();
        if (scroll < 50) {
            $(".bottom-header-area").removeClass("sticky");
        } else {
            $(".bottom-header-area").addClass("sticky");
        }
    });



//====search
    $(".search-btn").on('click', function(){
        $(".offcanvas-search-area").addClass("search-bar-active");
        $("body").addClass("search-active");
    });

    $(".close-bar i").on('click', function(){
        $(".offcanvas-search-area").removeClass("search-bar-active");
        $("body").removeClass("search-active");
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
      noResultsText: '<li>No results found</li>'
    });

});

// Update year

document.addEventListener('DOMContentLoaded', function () {
    const yearSpan = document.getElementById('current-year');
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;
});