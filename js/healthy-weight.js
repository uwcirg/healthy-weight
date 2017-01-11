let HealthyWeight = new Vue({
  el: "#healthy-weight",

  data: {
    bmiChartData: {},
    patient: {
      name: {},
      identifiers: [],
    },
  },

  created: function() {
    console.log('Initializing Healthy Weight SMART on FHIR application.');
    FHIR.oauth2.ready(this.loadPatient);
  },

  methods: {

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
        this.$set(this.patient, 'identifiers', patient.identifier);
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
            '_count': 1
          }
        }).then((bundle) => {

          this.$set(this.patient, 'weight', bundle.data.entry["0"].resource.valueQuantity.value);
          this.$set(this.patient, 'weightUnit', bundle.data.entry["0"].resource.valueQuantity.unit);
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
              label: 'Extensive Exercise',
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
              backgroundColor: "rgba(75,192,75,0.4)",
              borderColor: "rgba(75,192,75,1)",
            }, {
              label: 'Adequate Exercise',
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
              backgroundColor: "rgba(255,165,0,0.4)",
              borderColor: "rgba(255,165,0,1)",
            }, {
              label: 'Insufficient Exercise',
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
              backgroundColor: "rgba(192,75,75,0.4)",
              borderColor: "rgba(192,75,75,1)",
            }, {
              label: 'Patient BMI & Activity Level',
              data: patientChartData,
              backgroundColor: "rgba(75,75,75,0.4)",
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
      }).then(this.addBMIToChart);
    },
  },
});
