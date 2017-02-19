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
    },
  },

  created: function() {
    console.log('Initializing Healthy Weight SMART on FHIR application.');
    FHIR.oauth2.ready(this.loadPatient);
  },

  methods: {

    getCIRGdata: ( /** identifiers */ ) => {
      const identifiers = [{
        value: 29731,
      }];

      // fix wrong content type
      request.parse['text/html'] = JSON.parse;

      return request
        .get(CORS_PROXY + CIRG_API_BASE + identifiers[0].value)
        .end((err, res) => {
          if (res.body) {
            HealthyWeight.patient.cirg = res.body;
          }
        });
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
      // let bmi = weight / (height * height);
      // return parseFloat(bmi.toFixed(1));
    },

    calculateAge: function(birthDate) {
      let duration = moment.duration(moment().diff(birthDate));
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

    loadPatient: function(smart) {
      this.smart = smart;
      // Fetch patient demographics
      this.smart.patient.read().then((patient) => {
        this.$set(this.patient, 'id', patient.id);

        this.$set(this.patient, 'birthDate', patient.birthDate);
        this.$set(this.patient, 'gender', patient.gender);

        // this.$set(this.patient, 'identifiers', patient.identifier);
        this.$set(this.patient, 'mrn', this.getPreferredID(patient.identifier));

        this.$set(this.patient.name, 'given', patient.name[0].given[0]);
        this.$set(this.patient.name, 'family', patient.name[0].family[0]);

        // Calculate age
        this.$set(this.patient, 'age', this.calculateAge(patient.birthDate));
      }).then(() => {
        // Fetch latest weight
        return smart.patient.api.search({
          type: 'Observation',
          query: {
            code: '3141-9',
            // '_count': 1
          }
        }).then((bundle) => {
          let weights = bundle.data.entry.map((x) => {

            if (x.resource && x.resource.valueQuantity) { // check for the existance of at weight value
              return {
                value: x.resource.valueQuantity.value,
                unit: x.resource.valueQuantity.unit,
                date: moment(x.resource.effectiveDateTime).format('YYYY-MM-DD'),
              }
            } else return;
          });

          this.$set(this.patient, 'weights', weights);

          if (bundle.data.entry["0"].resource.valueQuantity) {
            this.$set(this.patient, 'weight', bundle.data.entry["0"].resource.valueQuantity.value);
            this.$set(this.patient, 'weightUnit', bundle.data.entry["0"].resource.valueQuantity.unit);
            this.$set(this.patient, 'weightDate', moment(bundle.data.entry["0"].resource.effectiveDateTime).format('YYYY-DD-MM'));
          } else {
            this.$set(this.patient, 'weight', 'Unknown');
          }
        });
      }).then(() => {
        // Fetch latest height
        return smart.patient.api.search({
          type: 'Observation',
          query: {
            code: '8302-2',
            '_count': 1
          }
        }).then((bundle) => {

          if (bundle.data.entry["0"].resource.valueQuantity) {
            this.$set(this.patient, 'height', bundle.data.entry["0"].resource.valueQuantity.value);
            this.$set(this.patient, 'heightUnit', bundle.data.entry["0"].resource.valueQuantity.unit);
          } else {
            this.$set(this.patient, 'height', 'Unknown');
          }

          // Calculate BMI
          this.$set(this.patient, 'bmi', this.calculateBMI(this.patient.height / 100, this.patient.weight));

          // Calculate historical BMIs
          this.$set(this.patient, 'bmis', this.calculateHistoricalBMIs(this.patient));

          let patientChartData = [{
            x: this.patient.age,
            y: this.patient.bmi
          }];

          // Setup chart data
          this.bmiChartData = {
            datasets: [{
              label: 'Extensive',
              data: [{
                x: 15,
                y: 18
              }, {
                x: 20,
                y: 20
              }, {
                x: 30,
                y: 22
              }, {
                x: 40,
                y: 24
              }, {
                x: 50,
                y: 24.5
              }, {
                x: 60,
                y: 24.5
              }, {
                x: 70,
                y: 24.3
              }],
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
                y: 28
              }, {
                x: 70,
                y: 28
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
                y: 35
              }, {
                x: 70,
                y: 35
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
              pointRadius: 10,
              pointHoverRadius: 10,
              pointBorderWidth: 4
            }]
          }
        });
      }).then(() => {
        let chartData = this.bmiChartData;

        // Build chart
        var ctx = document.getElementById("BMIChart");

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
              ctx.fillStyle = 'rgba(255,165,0,0.2)';//chart.config.options.chartArea.backgroundColor;
              ctx.fillRect(x_start, yellow.start, chartArea.right - x_start, (yellow.stop - yellow.start));

              // 20 - 25 green
              ctx.fillStyle = 'rgba(75,192,75,0.2)';//chart.config.options.chartArea.backgroundColor;
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
               ctx.fillStyle = 'rgba(255,165,0,0.2)';//chart.config.options.chartArea.backgroundColor;
               ctx.fillRect(left, yellow_kids.start, x_start - left, (yellow_kids.stop - yellow_kids.start));

               // green box
               let green_kids = {};
               green_kids.percent = (23 - 18) / numeric_range;
               green_kids.pixels = green_kids.percent * pixel_range;
               green_kids.start = yellow_kids.stop;
               green_kids.stop = green_kids.start + green_kids.pixels;

               // 18 - 23
               ctx.fillStyle = 'rgba(75,192,75,0.2)';//chart.config.options.chartArea.backgroundColor;
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

        var BMIChart = new Chart(ctx, {
          type: 'scatter',
          data: chartData,
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
      }).then(() => {
        return this.getCIRGdata();
      });

    },
  },
});
