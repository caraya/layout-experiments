  // --------------------------------------
  // Setup hyphenator
  //
  Hyphenator.config({
    displaytogglebox: true,
    classname: 'text',
    minwordlength: 4,
    togglebox: function() {
      let hyphenate = document.getElementById('hyphenToggle');

      if (Hyphenator.doHyphenation) {
        hyphenate.setAttribute('class', 'highlight');
        hyphenate.onclick = Hyphenator.toggleHyphenation;
      } else {
        hyphenate.removeAttribute('class');
        hyphenate.onclick = Hyphenator.toggleHyphenation;
      }
    },
  });
  Hyphenator.run();

  // alert(Hyphenator.doHyphenation);

  /**
   * @name showMenu
   *
   */
  function showMenu() {
    let menuToggle = document.querySelector('#menu_tab');
    // let menuDiv = document.querySelector('#menu_wrap');
    let menuContent = document.querySelector('menu');
    // by default, it only adds horizontal recognizers
    let mt = new Hammer(menuToggle);
    // let md = new Hammer(menuDiv);

    // listen to events...
    mt.on('tap', function() {
      // console.log(ev);
      if (menuContent.style.display == 'none') {
        menuContent.style.display = 'block';
      } else {
        menuContent.style.display = 'none';
      }
    });
  };
  showMenu();
// function menuSet() {
//     let container = document.querySelector('article');
//     console.log(container);
//     let classes = document.querySelectorAll();
//     console.log(classes);
//     classList = classList1.concat(classList2);

//     // // alert(classList);
//     // $.each(classList, function(index, item) {
//     //   // alert(item);
//     //   if (item==='bed') {
//     //       $('li.size1').addClass('highlight');
//     //   } else if (item==='knee') {
//     //       $('li.size2').addClass('highlight');
//     //   } else if (item==='breakfast') {
//     //       $('li.size3').addClass('highlight');
//     //   } else if (item==='low') {
//     //       $('li.lowc').addClass('highlight');
//     //   } else if (item==='high') {
//     //       $('li.highc').addClass('highlight');
//     //   } else if (item==='ragged') {
//     //       $('li.rag').addClass('highlight');
//     //   } else if (item==='justified') {
//     //       $('li.just').addClass('highlight');
//     //   } else if (item==='helvetica') {
//     //       $('li.hel').addClass('highlight');
//     //   } else if (item==='georgia') {
//     //       $('li.geo').addClass('highlight');
//     //   }
//     // });

//   menuSet();


//   // --------------------------------------
//   // Swipe Right to reload the page
//   // (great for quick debugging)
//   //

//   /*
//   $('body').addSwipeEvents().
//     bind('swiperight', function(evt, touch) {
//       window.location.reload();
//   });
//   */

//   // --------------------------------------
//   // Doubletap to show / hide menu
//   //
//   // $('body').addSwipeEvents().
//   //   bind('doubletap', function(evt, touch) {
//   //     $('menu').slideToggle('fast', function() {
//   //       // Animation complete.
//   //     });
//   // });


//   // --------------------------------------
//   // Doubleclick to show menu on desktop
//   //
//   /*
//   $(document).bind('dblclick', function(){
//     $('menu').slideToggle('fast', function() {
//         // Animation complete.
//       });
//   });*/

//   // Added menu tab instead of double click:
//   //  - Discoverable &
//   //  - Cleaner
//   $('#menu_tab').click(function() {
//     $('menu').slideToggle('fast', function() {
//         // Animation complete.
//       });
//   });
// }

//   // -------------------------------------
//   // Size toggles
//   //
//   $('.size1').click(function() {
//     $('#content_container').attr('class', 'bed');
//     menuSet();
//   });

//   $('.size2').click(function() {
//     $('#content_container').attr('class', 'knee');
//     menuSet();
//   });

//   $('.size3').click(function() {
//     $('#content_container').attr('class', 'breakfast');
//     menuSet();
//   });


//   // -------------------------------------
//   // Contrast Toggles
//   //
//   $('.highc').click(function() {
//     $('body').removeClass('low high').addClass('high');
//     menuSet();
//   });

//   $('.lowc').click(function() {
//     $('body').removeClass('low high').addClass('low');
//     menuSet();
//   });


//   // -------------------------------------
//   // Justification Toggles
//   //
//   $('.just').click(function() {
//     $('body').removeClass('ragged justified').addClass('justified');
//     menuSet();
//   });

//   $('.rag').click(function() {
//     $('body').removeClass('ragged justified').addClass('ragged');
//     menuSet();
//   });


//   // -------------------------------------
//   // Serif toggle
//   //
//   $('.hel').click(function() {
//     $('body').removeClass('georgia helvetica').addClass('helvetica');
//     menuSet();
//   });

//   $('.geo').click(function() {
//     $('body').removeClass('helvetica georgia').addClass('georgia');
//     menuSet();
//   });

//   // -------------------------------------
//   // Grid toggle
//   //
//   $('.bg_on').click(function() {
//     $('body').removeClass('bg_grid').addClass('bg_grid');
//     menuSet();
//   });

//   $('.bg_off').click(function() {
//     $('body').removeClass('bg_grid');
//     menuSet();
//   });
