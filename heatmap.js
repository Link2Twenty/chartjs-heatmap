(function () {
  'use strict';

  Chart.Heatmap = function (context, config) {
    config.type = 'heatmap';

    return new Chart(context, config);
  };

  var helpers = Chart.helpers;

  Chart.defaults.heatmap = {
    legend: {
      display: false
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItems, data) {
          if (tooltipItems.length > 0) {
            return data.yLabels[tooltipItems[0].yLabel];
          }

          return '';
        },
        label: function (tooltipItem, data) {
          let datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
          return datasetLabel + ': ' + (data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index].v * 100).toFixed(2) + '%';
        }
      }
    },
    yColors: [],
    scales: {
      xAxes: [{
        type: 'category',
        position: 'bottom',

        gridLines: {
          offsetGridLines: true
        }
      }],
      yAxes: [{
        type: 'category',
        position: 'left',

        gridLines: {
          offsetGridLines: true
        }
      }]
    }
  };

  Chart.controllers.heatmap = Chart.DatasetController.extend({
    datasetElementType: null,
    dataElementType: Chart.elements.Rectangle,

    update: function (reset) {
      helpers.each(this.getMeta().data, function (rectangle, index) {
        this.updateElement(rectangle, index, reset);
      }.bind(this), this);
    },

    updateElement: function (rectangle, index, reset) {
      var dataset = this.getDataset();
      var data = dataset.data[index];
      var meta = this.getMeta();
      var xScale = this.getScaleForId(meta.xAxisID);
      var yScale = this.getScaleForId(meta.yAxisID);
      var yTickHeight = Math.abs(yScale.getPixelForTick(1.1) - yScale.getPixelForTick(0.2));
      var xTickWidth = Math.abs(xScale.getPixelForTick(index + 0.9) - xScale.getPixelForTick(index));

      var xCoord = typeof data.x === "string" ? this.chart.config.data.xLabels.indexOf(data.x) : data.x;
      var yCoord = typeof data.y === "string" ? this.chart.config.data.yLabels.indexOf(data.y) : data.y;

      var color = this.chart.options.yColors[yCoord] || {
        r: 100,
        g: 100,
        b: 100
      };

      rectangle._xScale = xScale;
      rectangle._yScale = yScale;
      rectangle._datasetIndex = this.index;
      rectangle._index = index;
      rectangle._model = {
        x: reset ? xScale.getPixelForDecimal(0.5) : xScale.getPixelForValue(null, xCoord, this.index, true),
        y: reset ? yScale.getBasePixel() : yScale.getPixelForTick(yCoord),

        // Tooltip
        label: this.chart.data.labels[index],
        datasetLabel: dataset.label,

        // Appearance
        base: yScale.getPixelForTick(yCoord) + yTickHeight,
        width: xTickWidth,
        backgroundColor: 'rgba(' +
          (data.color ? data.color.r || color.r : color.r) + ', ' +
          (data.color ? data.color.g || color.g : color.g) + ', ' +
          (data.color ? data.color.b || color.b : color.b) + ', ' +
          (data.a || 1) + ')'
      };

      rectangle.pivot();
    },

    removeHoverStyle: function (rectangle) {
      var dataset = this.chart.data.datasets[rectangle._datasetIndex];
      var index = rectangle._index;
      var model = rectangle._model;
      var options = this.chart.options;
      var data = dataset.data[index];

      var color = options.yColors[data.y] || {
        r: 100,
        g: 100,
        b: 100
      };
      model.backgroundColor = 'rgba(' +
        (data.color ? data.color.r || color.r : color.r) + ', ' +
        (data.color ? data.color.g || color.g : color.g) + ', ' +
        (data.color ? data.color.b || color.b : color.b) + ', ' +
        (data.a || 1) + ')'
    }
  });
})();
