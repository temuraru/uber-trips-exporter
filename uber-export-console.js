// This file is to be copy-pasted and run into a browser console on the "My Trips" page of an Uber account

// The https://riders.uber.com/trips scraper specification
var scraper = {
  iterator: '.hard .palm-one-whole',
  data: {
    trip_id: function($) {
        return $(this).closest('tr').prev().data("target").slice(6)
    },
    date: function($) {
      var dates =  $(this).closest('tr').prev().find("td:nth-child(2)").text().substring(0, 8);
        return dates.length ? dates : '-';
    },
    date_time: {
      sel: '.soft-half--ends h6:nth-child(1)',
      method: function($) {
        return $(this).length ? $(this).text() : '-';
      }
    },
    driver: function($) {
        var nb = $(this).closest('tr').prev().find("td:nth-child(3)").text();
        return nb.length ? nb : '-';
    },
    car_type: function($) {
        var nb = $(this).closest('tr').prev().find("td:nth-child(5)").text();
        return nb.length ? nb : '-';
    },
    city: function($) {
        var nb = $(this).closest('tr').prev().find("td:nth-child(6)").text();
        return nb.length ? nb : '-';
    },
    price: {
      method: function($) {
      var nb = $(this).closest('tr').prev().find("td:nth-child(4)").text().replace('RON', '');
        // console.log('price: ', $(this).closest('tr').prev().find("td:nth-child(4)"), nb, nb.length);
        return isNaN(nb) ? (nb.length ? nb : 0) : (+nb).toFixed(2);
      }
    },
    payment_method: function($) {
        return $(this).closest('tr').prev().find("td:nth-child(7) span:nth-child(2)").text().replace(/[•\s]+/g, '')
    },
    start_time: {
      sel: '.trip-address:nth-child(1) p',
      method: function($) {
        return $(this).length ? $(this).text() : '-';
      }
    },
    start_address: {
      sel: '.trip-address:nth-child(1) h6',
      method: function($) {
        return $(this).length ? $(this).text() : '-';
      }
    },
    end_time: {
      sel: '.trip-address:nth-child(2) p',
      method: function($) {
        return $(this).length ? $(this).text() : '-';
      }
    },
    end_address: {
      sel: '.trip-address:nth-child(2) h6',
      method: function($) {
        return $(this).length ? $(this).text() : '-';
      }
    }
  }
};

// Handle pagination
function nextUrl($page) {
  var url = $page.find('a.btn.pagination__next').attr('href');
  artoo.log.debug('Scraping page: '+ (url  || 'final page scraped!'));
  return url;
}

// Start the scraper
artoo.log.debug('Starting the scraper...');
var ui = new artoo.ui();
ui.$().append('<div style="position:fixed; top:35px; left:25px; background-color: #000; color: #FFF; z-index:1000">Scraping in progress... this may take a few minutes!</div>');
var uber = artoo.scrape(scraper);

// Launch the spider
artoo.ajaxSpider(
  function(i, $data) {
    return nextUrl(!i ? artoo.$(document) : $data);
  },
  {
    limit: 500,
    // throttle: 4000,
    scrape: scraper,
    concat: true,
    done: function(data) {
      artoo.log.debug('Finished retrieving data. Downloading...');
      ui.kill();
      var currentDate = new Date().toJSON().slice(0,10);
      artoo.saveCsv(
        uber.concat(data),
        {filename: currentDate+'_uber-trips-export.csv'}
      );
    }
  }
);
