import moment from 'moment';
import request from 'superagent';
import Vue from 'vue/dist/vue.min.js';

/* material design */
require('../node_modules/material-design-lite/material.min.css');

// const CORS_PROXY = 'https://crossorigin.me/';
const CORS_PROXY = 'https://jsonp.afeld.me/?url=';
// const CORS_PROXY = '';
const CIRG_API_BASE = 'https://ihe.cirg.washington.edu/himss2017/api.php/';

const PREFERRED_ID_OID = 'urn:oid:1.2.5.8.2.7';

let HealthyWeight = new Vue({
  el: "#healthy-weight",

  data: {
    bmiChartData: {},
    patient: {
      name: {},
      identifiers: [],
      cirg: {},
      weights: [],
      historicalBmis: [],
    },
  },

  created: function() {
    console.log('Initializing Healthy Weight SMART on FHIR application.');
    this.loadPatient();
    window.setTimeout(this.drawChart, 1000);
  },

  methods: {

    getCIRGdata: (patient) => {
      // fix wrong content type
      // request.parse['text/html'] = JSON.parse;
      //
      // return request
      //   .get(CORS_PROXY + CIRG_API_BASE + HealthyWeight.patient.mrn)
      //   .end((err, res) => {
      //     if (res.body) {
      //       HealthyWeight.patient.cirg = res.body;
      //     }
      //   });
      //
      patient.cirg = {
        occupation_23: "Nursing, psychiatric, and home health aides",
        occupation_start: "2016-09-08",
        occupation_stop: "2017-01-12",
        occupation_industry: "Nursing care facilities",
        occupation_type: "In paid employment (finding)",
        occupation_schedule: "Rotating Shift",
        occupation_hours: "32",
        occupation_days: "4",
        occupation_usual: "Nursing, psychiatric, and home health aides",
        occupation_usual_duration: ".5a",
        occupation_usual_industry: "Nursing care facilities",
        occupation_usual_industry_duration: ".5a",
        freq_sports_drink: "2",
        freq_soda: "4",
        freq_water: "1",
        freq_veg: "1",
        freq_fruit: "1",
        freq_fruit_juice: "2",
        freq_fast_food: "2",
        freq_physical: "4",
        physical_quantity: "20",
        tv_quantity: null,
        game_quantity: null,
        bed_time: "1am",
        sleep_quantity: "6",
        ready_nutrition: "7",
        ready_sleep: "6",
        ready_exercise: "7",
        ready_screen: null
      };

      return;
    },

    calculateBMI: function(height, weight) {
      let bmi = weight / (height * height);
      if (!isNaN(bmi)) {
        return parseFloat(bmi.toFixed(1));
      } else {
        return 'Unknown';
      }
    },

    calculateHistoricalBMIs: function(patient) {

      // if (patient.height) {
      //
      //   if (patient.weights) {
      //
      //     patient.weights.forEach(function(weight, index, array) {
      //       patient.historicalBmis.push({
      //         age: HealthyWeight.calculateAge(patient.birthDate, weight.date),
      //       });
      //     });
      //   }
      // }
      // let bmi = weight / (height * height);
      // return parseFloat(bmi.toFixed(1));
      //
    },

    calculateAge: function(birthDate, effectiveDate) {
      let duration;

      if (effectiveDate) {
        duration = moment.duration(moment(effectiveDate).diff(birthDate));
      } else {
        duration = moment.duration(moment().diff(birthDate));
      }

      let age = duration.asYears();
      return parseFloat(age.toFixed(1));
    },

    getPreferredID: function(ids) {
      let id = ids[0].value;

      ids.forEach((value, key, array) => {
        if (value.system && value.system == PREFERRED_ID_OID) {
          id = value.value;
        }
      });

      return id;
    },

    drawChart: function() {
      // Build chart
      var ctx = document.getElementById("BMIChart");

      let patientChartData = [{
        x: this.patient.age,
        y: this.patient.bmi
      }];

      // Setup chart data
      let bmiChartData = {
        datasets: [{
          label: 'Extensive',
          data: [{
              x: 15,
              y: 18
            },
            {
              x: 20,
              y: 20
            },
            {
              x: 30,
              y: 22
            },
            {
              x: 40,
              y: 24
            },
            {
              x: 50,
              y: 24.5
            }, {
              x: 60,
              y: 24.1
            }, {
              x: 70,
              y: 22.3
            }
          ],
          // backgroundColor: "rgba(75,192,75,0.4)",
          backgroundColor: "rgba(255,255,255,0.0)",
          borderColor: "rgba(75,192,75,1)",
        }, {
          label: 'Adequate',
          data: [{
            x: 15,
            y: 22
          }, {
            x: 20,
            y: 24
          }, {
            x: 30,
            y: 26
          }, {
            x: 40,
            y: 27
          }, {
            x: 50,
            y: 27.5
          }, {
            x: 60,
            y: 27
          }, {
            x: 70,
            y: 26
          }],
          // backgroundColor: "rgba(255,165,0,0.4)",
          backgroundColor: "rgba(255,255,255,0.0)",
          borderColor: "rgba(255,165,0,1)",
        }, {
          label: 'Insufficient',
          data: [{
            x: 15,
            y: 26
          }, {
            x: 20,
            y: 30
          }, {
            x: 30,
            y: 32
          }, {
            x: 40,
            y: 34
          }, {
            x: 50,
            y: 34.5
          }, {
            x: 60,
            y: 33.3
          }, {
            x: 70,
            y: 30
          }],
          // backgroundColor: "rgba(192,75,75,0.4)",
          backgroundColor: "rgba(255,255,255,0.0)",
          borderColor: "rgba(192,75,75,1)",
        }, {
          label: 'Patient',
          data: patientChartData,
          // backgroundColor: "rgba(75,75,75,0.4)",
          backgroundColor: "rgba(255,255,255,0.0)",
          borderColor: "rgba(16,16,16,1)",
          pointRadius: 7,
          pointHoverRadius: 10,
          pointBorderWidth: 3
        }]
      };

      // Background colors plugin
      Chart.pluginService.register({
        beforeDraw: function(chart, easing) {
          if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
            var helpers = Chart.helpers;
            var ctx = chart.chart.ctx;
            var chartArea = chart.chartArea;

            let top = chart.chartArea.top;
            let bottom = chart.chartArea.bottom;
            let left = chartArea.left;
            let right = chartArea.right;

            let numeric_range = 39 - 15;
            let pixel_range = bottom - top;

            /**
             *
             * ADULTS
             *
             */

            let x_start = left + ((20 - 15) / (70 - 15)) * (right - left);

            // red box
            let red = {};
            red.percent = (39 - 30) / numeric_range;
            red.pixels = red.percent * pixel_range;
            red.start = top;
            red.stop = red.start + red.pixels;

            // yellow box
            let yellow = {};
            yellow.percent = (30 - 25) / numeric_range;
            yellow.pixels = yellow.percent * pixel_range;
            yellow.start = red.stop;
            yellow.stop = yellow.start + yellow.pixels;

            // green box
            let green = {};
            green.percent = (25 - 20) / numeric_range;
            green.pixels = yellow.percent * pixel_range;
            green.start = yellow.stop;
            green.stop = green.start + green.pixels;

            // blue box
            let blue = {};
            blue.percent = (20 - 15) / numeric_range;
            blue.pixels = blue.percent * pixel_range;
            blue.start = green.stop;
            blue.stop = blue.start + blue.pixels;

            ctx.save();

            // > 30 red
            ctx.fillStyle = 'rgba(192,75,75,0.2)';
            ctx.fillRect(x_start, red.start, chartArea.right - x_start, (red.stop - red.start));

            // 25 - 30 yellow
            ctx.fillStyle = 'rgba(255,165,0,0.2)'; //chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(x_start, yellow.start, chartArea.right - x_start, (yellow.stop - yellow.start));

            // 20 - 25 green
            ctx.fillStyle = 'rgba(75,192,75,0.2)'; //chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(x_start, green.start, chartArea.right - x_start, (green.stop - green.start));


            // < 20 blue
            ctx.fillStyle = 'rgba(75,75,192,0.2)';
            ctx.fillRect(x_start, blue.start, chartArea.right - x_start, (blue.stop - blue.start));

            /**
             *
             * KIDS
             *
             */

            // red box
            let red_kids = {};
            red_kids.percent = (39 - 27) / numeric_range;
            red_kids.pixels = red_kids.percent * pixel_range;
            red_kids.start = top;
            red_kids.stop = red_kids.start + red_kids.pixels;

            // > 27 red
            ctx.fillStyle = 'rgba(192,75,75,0.2)';
            ctx.fillRect(left, red_kids.start, x_start - left, (red_kids.stop - red_kids.start));

            // yellow box
            let yellow_kids = {};
            yellow_kids.percent = (27 - 23) / numeric_range;
            yellow_kids.pixels = yellow_kids.percent * pixel_range;
            yellow_kids.start = red_kids.stop;
            yellow_kids.stop = yellow_kids.start + yellow_kids.pixels;

            // 23 - 27 yellow
            ctx.fillStyle = 'rgba(255,165,0,0.2)'; //chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(left, yellow_kids.start, x_start - left, (yellow_kids.stop - yellow_kids.start));

            // green box
            let green_kids = {};
            green_kids.percent = (23 - 18) / numeric_range;
            green_kids.pixels = green_kids.percent * pixel_range;
            green_kids.start = yellow_kids.stop;
            green_kids.stop = green_kids.start + green_kids.pixels;

            // 18 - 23
            ctx.fillStyle = 'rgba(75,192,75,0.2)'; //chart.config.options.chartArea.backgroundColor;
            ctx.fillRect(left, green_kids.start, x_start - left, (green_kids.stop - green_kids.start));

            // blue box
            let blue_kids = {};
            blue_kids.percent = (18 - 15) / numeric_range;
            blue_kids.pixels = blue_kids.percent * pixel_range;
            blue_kids.start = green_kids.stop;
            blue_kids.stop = blue_kids.start + blue_kids.pixels;

            // < 18 blue
            ctx.fillStyle = 'rgba(75,75,192,0.2)';
            ctx.fillRect(left, blue_kids.start, x_start - left, (blue_kids.stop - blue_kids.start));

            ctx.restore();
          }
        }
      });

      let BMIChart = new Chart(ctx, {
        type: 'scatter',
        data: bmiChartData,
        options: {
          chartArea: {
            backgroundColor: 'rgba(251, 85, 85, 0.4)'
          },
          scales: {
            yAxes: [{
              ticks: {
                max: 39,
                min: 15,
                stepSize: 3
              },
              scaleLabel: {
                display: true,
                labelString: 'MEDIAN BMI',
              }
            }],
            xAxes: [{
              ticks: {
                max: 70,
                min: 15,
                stepSize: 10
              },
              scaleLabel: {
                display: true,
                labelString: 'AGE',
              }
            }]
          }
        }
      });

      this.chart = BMIChart;
    },

    loadPatient: function(smart) {

      // statically set all patient data
      this.$set(this.patient, 'id', 123);

      this.$set(this.patient, 'birthDate', '1999-08-13');
      this.$set(this.patient, 'gender', 'female');

      // this.$set(this.patient, 'identifiers', patient.identifier);
      this.$set(this.patient, 'mrn', '34174');

      this.$set(this.patient.name, 'given', 'Sofia');
      this.$set(this.patient.name, 'family', 'Santana');

      // Calculate age
      this.$set(this.patient, 'age', 17);

      this.$set(this.patient, 'weight', '80.7');
      this.$set(this.patient, 'weightUnit', 'kg');
      this.$set(this.patient, 'weightDate', '2017-02-02');

      this.$set(this.patient, 'height', 162);
      this.$set(this.patient, 'heightUnit', 'cm');

      // Calculate BMI
      this.$set(this.patient, 'bmi', this.calculateBMI(this.patient.height / 100, this.patient.weight));

      // Calculate historical BMIs
      this.$set(this.patient, 'bmis', this.calculateHistoricalBMIs(this.patient));

      this.getCIRGdata(this.patient);
    },
  },
});
