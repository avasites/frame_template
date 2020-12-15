import './promo-slider.scss';

import Swiper, {Pagination, Navigation } from 'swiper';
// import Swiper styles
import 'swiper/swiper-bundle.css';
Swiper.use([Pagination, Navigation]);
var swiper = new Swiper('.swiper-container', {
    hashNavigation: {
        watchState: true,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        progressbarOpposite: true
    },
    navigation: {
        nextEl: '.slider-next ',
        prevEl: '.slider-prev ',
      },
  });
console.log(swiper)