const NS = 'http://www.w3.org/2000/svg';
const VB_PAD = 1;

/**
 * @param {Date} date
*/
function niceDate (date) {
  const fmt = new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  return fmt.format(date);
}
/**
 * @param {Date} date
*/
function isoDate (date) {
  const y = date.getFullYear();
  const m = date.getMonth() +  1;
  const d = date.getDay();
  return `${y}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
}

Object.defineProperty(Array.prototype, 'last', {
  get () { return this[this.length - 1]; },
  set (value) { this[this.length - 1] = value; }
});

/**
 * Draw a chart within an SVG element
 *
 * @param {SVGElement} chart <SVG> element to draw chart within
 * @param {Array} data Data to plot
 * @param {Object} options Options object
 */
export function draw (chart, data, options) {
  console.log('drawing...');
  const xKey = options.xKey ?? 'x';
  const yKey = options.yKey ?? 'y';
  const xSort = options.xSort ?? ((a, b) => a - b);

  data.sort((a, b) => xSort(a[xKey], b[xKey]));
  const xMin = Number(data[0][xKey]);
  const xMax = Number(data.last[xKey]);
  const xFac = 1000 * 60 * 60 * 24;
  const xLen = (xMax - xMin) / xFac;
  const yMin = Number(data.reduce((a, b) => a[yKey] < b[yKey] ? a : b)[yKey]);
  const yMax = Number(data.reduce((a, b) => a[yKey] > b[yKey] ? a : b)[yKey]);
  console.log({xMin,xMax,xLen,yMin,yMax});
  console.log(`${0 - VB_PAD} ${(yMax + VB_PAD) * -1} ${xLen + 2 * VB_PAD} ${yMax - yMin + 2 * VB_PAD}`);

  // chart.setAttribute('viewBox', `${xMin} ${xMax - xMin} ${yMin} ${yMax - yMin}`);
  chart.setAttribute('viewBox', `${0 - VB_PAD} ${(yMax + VB_PAD) * -1} ${xLen + 2 * VB_PAD} ${yMax - yMin + 2 * VB_PAD}`);

  const path = document.createElementNS(NS, 'path');
  const d = 'M ' + data.map(({[xKey]: x, [yKey]: y}, i) => `${(Number(x) - xMin) / xFac},${Number(y)}`).join(' L ');
  console.log({d});
  path.setAttribute('d', d);
  path.classList.add('data-line')
  // path.setAttribute('fill', 'none');
  // path.setAttribute('stroke', 'red');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  path.setAttribute('transform', 'scale(1, -1)');
  chart.append(path);

  const points = document.createElementNS(NS, 'g');
  data.forEach(({[xKey]: x, [yKey]: y}, i) => {
    const point = document.createElementNS(NS, 'circle');
    point.classList.add('data-point')
    // point.setAttribute('cx', i);
    point.setAttribute('cx', (Number(x) - xMin) / xFac);
    point.setAttribute('cy', Number(y));
    point.setAttribute('r', 0.0001);
    point.setAttribute('transform', 'scale(1, -1)');
    point.setAttribute('title', `${niceDate(x)}, ${y}`);
    point.dataset.date = niceDate(x);
    point.dataset.cents = y;
    // point.setAttribute('vector-effect', 'non-scaling-stroke');
    points.append(point);
  });
  chart.append(points);
}