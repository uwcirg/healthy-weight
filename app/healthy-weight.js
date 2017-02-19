import moment from 'moment';
import request from 'superagent';
import Vue from 'vue/dist/vue.min.js';

/* material design */
require('../node_modules/material-design-lite/material.min.css');

const CORS_PROXY = 'https://crossorigin.me/';
// const CORS_PROXY = '';
const CIRG_API_BASE = 'https://ihe.cirg.washington.edu/himss2017/api.php/';

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
        .get(CORS_PROXY + CIRG_API_BASE + '29731')
        .end((err, res) => {
          console.log(res);
          HealthyWeight.patient.cirg = res.body;
        });
    },

    calculateBMI: function(height, weight) {
      let bmi = weight / (height * height);
      return parseFloat(bmi.toFixed(1));
    },

    calculateAge: function(birthDate) {
      let duration = moment.duration(moment().diff(birthDate));
      let age = duration.asYears();
      return parseFloat(age.toFixed(1));
    },

    loadPatient: function(smart) {
      this.smart = smart;
      // Fetch patient demographics
      this.smart.patient.read().then((patient) => {
        this.$set(this.patient, 'id', patient.id);

        this.$set(this.patient, 'birthDate', patient.birthDate);
        this.$set(this.patient, 'gender', patient.gender);

        // this.$set(this.patient, 'identifiers', patient.identifier);
        this.$set(this.patient, 'mrn', patient.identifier[0].value);

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

            if(x.resource && x.resource.valueQuantity) { // check for the existance of at weight value
              return {
                value: x.resource.valueQuantity.value,
                unit: x.resource.valueQuantity.unit,
                date: moment(x.resource.effectiveDateTime).format('YYYY-MM-DD'),
              }
            } else return;
          });

          this.$set(this.patient, 'weights', weights);

          this.$set(this.patient, 'weight', bundle.data.entry["0"].resource.valueQuantity.value);
          this.$set(this.patient, 'weightUnit', bundle.data.entry["0"].resource.valueQuantity.unit);
          this.$set(this.patient, 'weightDate', moment(bundle.data.entry["0"].resource.effectiveDateTime).format('YYYY-DD-MM'));
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

          this.$set(this.patient, 'height', bundle.data.entry["0"].resource.valueQuantity.value);
          this.$set(this.patient, 'heightUnit', bundle.data.entry["0"].resource.valueQuantity.unit);

          // Calculate BMI
          this.$set(this.patient, 'bmi', this.calculateBMI(this.patient.height / 100, this.patient.weight));

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

        var BMIChart = new Chart(ctx, {
          type: 'scatter',
          data: chartData,
          options: {
            scales: {
              yAxes: [{
                ticks: {
                  max: 39,
                  min: 15,
                  stepSize: 3
                }
              }],
              xAxes: [{
                ticks: {
                  max: 70,
                  min: 15,
                  stepSize: 10
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
