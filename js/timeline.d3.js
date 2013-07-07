;(function(alias) {
	'use strict';

	var timeline = alias.timeline = {};

	timeline.cursor = {};
	timeline.cursor.build = function(svg, viewver) {
		this.data = viewver.data;

		this.cursorArea = svg
			.append('g')
				.attr('x', viewver.laneLabelWidth)
				.attr("clip-path", "url(#clip)")
				.attr('width', viewver.width)
				.attr('height', viewver.height)
				.attr('class', 'cursor')
		;

		this.cursor = this.cursorArea
			.append('g')
				.attr('width', viewver.width)
				.attr('height', viewver.height)
		;

		this.line = this.cursor
			.append('line')
				.attr('x1', 0)
				.attr('y1', 0)
				.attr('x2', 0)
				.attr('y2', viewver.height - viewver.legendHeight + ((viewver.legendHeight / 3)))
				.attr('class', 'line')
		;

		this.date = this.cursor
			.append('text')
			.attr('x', 5)
			.text(moment.unix(viewver.start).format('MMMM'))
			.attr('class', 'date')
		;

		this.date
			.attr('y', viewver.height - (viewver.legendHeight - (this.date.node().getBBox().height)))
		;

		var lanes = viewver.lanes.values();

		for (var i = 0; i < lanes.length; i++) {
			this.cursor
				.append("text")
					.attr('class', 'lane')
					.attr('id', 'lane' + i)
					.attr('x', 5)
					.attr("y", viewver.scaleY(i) + (viewver.laneHeight / 2))
					.attr('visibility', 'hidden')
			;
		}

		var cursorArea = this.cursorArea;
		var cursor = this.cursor;
		var date = this.date;

		d3.select(window).on('mousemove.timeline', function() {
				var mouse = d3.mouse(cursorArea.node());
				var currentDate = viewver.scaleX.invert(mouse[0]);

				date.text(moment.unix(currentDate).format('MMMM'));

				cursor.selectAll('text.lane').attr('visibility', 'hidden');

				viewver.events
					.selectAll('rect')
						.filter(function(d) { return (d.start < currentDate && (d.end == null || currentDate <= d.end)); })
							.each(function(d) {
									cursor
										.select('#lane' + viewver.lanes.values().indexOf(d.lane))
											.text(d.id)
											.attr('visibility', 'visible')
									;
								}
							)
				;

				cursor
					.attr("transform", "translate(" + mouse[0] + ", 0)")
					.selectAll('text')
						.each(function() {
							var length = this.getComputedTextLength();
							var x = 5;

							if (mouse[0] + length + 10 > viewver.width) {
								x = - length - 5;
							}

							d3.select(this).attr("x", x);
						}
					)
				;
			}
		);

		return this;
	};

	timeline.viewver = {};
	timeline.viewver.build = function(svg, width, height, data, options) {
		if (!options.laneLabelWidth) options.laneLabelWidth = 40;
		if (!options.legendHeight) options.legendHeight = 40;

		this.width = width;
		this.height = height;
		this.laneLabelWidth = options.laneLabelWidth;
		this.legendHeight = options.legendHeight;

		this.g = svg.append('g')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('class', 'viewver')
		;

		this.data = data;
		this.start = timeline.getStart(this.data);
		this.end = timeline.getEnd(this.data);

		var lanes = d3.set();

		d3.values(data).forEach(function(d) {
				if (lanes.has(d.lane) === false) {
					lanes.add(d.lane);
				}
			}
		);

		this.lanes = lanes;
		this.laneHeight = (this.height - this.legendHeight) / this.lanes.values().length;

		this.scaleX = d3.scale.linear()
			.domain([ this.start, this.end ])
			.range([ this.laneLabelWidth, width ])
		;

		this.scaleY = d3.scale.linear()
			.domain([ 0, this.lanes.values().length ])
			.range([ 0, this.height - this.legendHeight ])
		;

		var lanes = this.lanes.values();

		for (var i = 0; i < lanes.length; i++) {
			var laneRow = this.g
				.append('g')
					.attr('transform', 'translate(0, ' + this.scaleY(i) + ')')
					.attr('width', this.width)
					.attr('height', this.laneHeight)
					.attr('class', 'lane' + (i %2 ? 'Odd' : 'Even'))
			;

			laneRow.append('rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', this.width)
					.attr('height', this.laneHeight)
			;

			laneRow
				.append('text')
					.text(lanes[i])
					.attr('class', 'laneLabel')
					.attr('x', 10)
					.attr('y', this.laneHeight / 2)
			;
		}

		this.g
			.append('clipPath')
				.attr('id', 'clip')
				.append('rect')
					.attr('x', this.laneLabelWidth)
					.attr('width', this.width - this.laneLabelWidth)
					.attr('height', this.height)
		;

		this.events = this.g
			.append('g')
				.attr("clip-path", "url(#clip)")
				.attr('x', this.laneLabelWidth)
				.attr('width', this.width)
				.attr('height', this.height)
				.attr('class', 'events')
		;

		this.legend = this.g
			.append('g')
				.attr("clip-path", "url(#clip)")
				.attr('width', this.width)
				.attr('height', height)
				.attr('class', 'legend')
		;

		this.legend
			.append('line')
				.attr('x1', this.width)
				.attr('y1', 0)
				.attr('x2', this.width)
				.attr('y2', this.legend.attr('height'))
				.attr('class', 'border')
		;

		this.legend
			.append('line')
				.attr('x1', this.laneLabelWidth)
				.attr('y1', 1)
				.attr('x2', this.width)
				.attr('y2', 1)
				.attr('class', 'border')
		;

		this.legend
			.append('line')
				.attr('x1', this.laneLabelWidth)
				.attr('y1', this.height - this.legendHeight)
				.attr('x2', this.width)
				.attr('y2', this.height - this.legendHeight)
				.attr('class', 'border')
		;

		this.legend
			.append('line')
				.attr('x1', this.laneLabelWidth)
				.attr('y1', this.height - ((this.legendHeight / 3) * 2))
				.attr('x2', this.width)
				.attr('y2', this.height - ((this.legendHeight / 3) * 2))
				.attr('class', 'border')
		;

		this.legend
			.append('line')
				.attr('x1', this.laneLabelWidth)
				.attr('y1', this.height)
				.attr('x2', this.width)
				.attr('y2', this.height)
				.attr('class', 'border')
		;

		this.cursor = timeline.cursor.build(this.g, this);

		this.display = function() {
			var startYear = moment.unix(this.start);
			var endYear = moment.unix(this.end);

			while (startYear.isBefore(endYear)) {
				var timestamp = startYear.format('X');
				var x = this.scaleX(timestamp);

				var year = this.legend
					.append('g')
						.attr('id', timestamp)
						.attr('class', 'year dynamic')
						.attr('transform', 'translate(' + x + ', 0)')
				;

				year
					.append('line')
						.attr('x1', 0)
						.attr('y1', 0)
						.attr('x2', 0)
						.attr('y2', this.legend.attr('height'))
				;

				year
					.append('text')
						.text(startYear.format('YYYY'))
						.attr('class', 'year')
						.attr('x', 10)
						.attr('y', height - 10)
				;

				startYear.add('years', 1);
			}

			var viewver = this;
			var cssClassGenerator = timeline.cssClassGenerator.build(this.lanes.values());

			this.events
				.selectAll('.event')
					.data(this.data)
							.enter()
								.append('rect')
									.attr('x', function(d) { return viewver.getEventX(d); })
									.attr('y', function(d) { return viewver.getEventY(d); })
									.attr('height', function(d) { return viewver.getEventHeight(d); }) 
									.attr('width', function(d) { return viewver.getEventWidth(d); })
									.attr('class', function(d) { return 'event ' + cssClassGenerator.getForEvent(d); })
			;
		};

		this.refresh = function(start, end) {
			this.start = start;
			this.end = end;
			this.scaleX.domain([ this.start, this.end ]);

			var rects = this.events.selectAll('rect');

			var viewver = this;

			this.events
				.selectAll('rect')
					.attr('x', function(d) { return viewver.getEventX(d); })
					.attr('width', function(d) { return viewver.getEventWidth(d); })
			;

			this.legend
				.selectAll('g.dynamic')
					.attr('transform', function() { return 'translate(' + viewver.scaleX(d3.select(this).attr('id')) + ', 0)'; })
			;
		};

		this.getEventX = function(event) {
			return this.scaleX(event.start);
		};

		this.getEventY = function(event) {
			return this.scaleY(this.lanes.values().indexOf(event.lane)) + (this.laneHeight - (this.laneHeight * 0.75)) / 2;
		};

		this.getEventWidth = function(event) {
			return this.scaleX(event.end) - this.scaleX(event.start);
		};

		this.getEventHeight = function(event) {
			return this.laneHeight * 0.75; 
		};

		return this;
	};

	timeline.explorer = {};
	timeline.explorer.bind = function(viewver) { this.viewver = viewver; return this; };
	timeline.explorer.build = function(svg, width, height, offsetX, offsetY, data) {
		this.width = width - offsetX;
		this.height = height;

		this.g = svg.append('g')
			.attr('transform', 'translate(' + offsetX + ', ' + offsetY + ')')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('class', 'explorer')
		;

		this.data = data;
		this.start = timeline.getStart(this.data);
		this.end = timeline.getEnd(this.data);

		var lanes = d3.set();

		d3.values(data).forEach(function(d) {
				if (lanes.has(d.lane) === false) {
					lanes.add(d.lane);
				}
			}
		);

		this.lanes = lanes;
		this.laneHeight = this.height / this.lanes.values().length;

		this.scaleX = d3.scale.linear()
			.domain([ this.start, this.end ])
			.range([ 0, this.width ])
		;

		this.scaleY = d3.scale.linear()
			.domain([ 0, this.lanes.values().length ])
			.range([ 0, this.height ])
		;

		var explorer = this;
		var cssClassGenerator = timeline.cssClassGenerator.build(this.lanes.values());

		this.g.append('rect')
			.attr('width', this.width)
			.attr('height', this.height)
			.attr('class', 'panel')
		;

		var explorer = this;

		this.brush = d3.svg.brush()
			.x(this.scaleX)
			.on('brush', function() {
					if (explorer.viewver) {
						var extent = explorer.brush.extent();

						if (extent[1] - extent[0] > 0) {
							explorer.viewver.refresh(extent[0], extent[1]);
						}
					}
				}
			)
		;

		this.events = this.g.append('g');

		this.g.append('g')
			.attr('class', 'brush')
			.call(this.brush)
			.selectAll('rect')
				.attr('x', 0)
				.attr('y', 0)
				.attr('height', this.height)
		;

		this.display = function() {
			this.events
				.selectAll('.event')
					.data(this.data)
						.enter()
							.append('rect')
								.attr('x', function(d) { return explorer.getEventX(d); })
								.attr('y', function(d) { return explorer.getEventY(d); })
								.attr('height', function(d) { return explorer.getEventHeight(d); }) 
								.attr('width', function(d) { return explorer.getEventWidth(d); })
								.attr('class', function(d) { return cssClassGenerator.getForEvent(d); })
			;

			return this;
		};

		this.getEventX = function(event) {
			return this.scaleX(event.start);
		};

		this.getEventY = function(event) {
			return this.scaleY(this.lanes.values().indexOf(event.lane)) + (this.laneHeight - (this.laneHeight * 0.75)) / 2;
		};

		this.getEventWidth = function(event) {
			return this.scaleX(event.end) - this.scaleX(event.start); 
		};

		this.getEventHeight = function(event) {
			return this.laneHeight * 0.75; 
		};

		return this;
	};

	timeline.cssClassGenerator = {};
	timeline.cssClassGenerator.build = function(lanes) {
		this.index = 0;
		this.modulo = 0;
		this.lanes = lanes;;
		this.getForEvent = function(event) {
			var index = this.lanes.indexOf(event.lane);

			if (index != this.index) {
				this.modulo = 0;
				this.index = index;
			}

			var cssClass = 'lane' + index + ' ' + (this.modulo++ % 2 ? 'eventOdd' : 'eventEven');

			if (event.dead) {
				cssClass += ' dead';
			}

			return cssClass;
		};

		return this;
	};

	timeline.build = function (data, target, options) {
		if (!options) {
			options = {};
		};

		if (!options.width) options.width = 960;
		if (!options.dataHeight) options.dataHeight = 400;
		if (!options.explorerHeight) options.explorerHeight = 100;
		if (!options.cssClass) options.cssClass = 'timeline';

		this.svg = d3.select(target)
			.append('svg')
				.attr('x', 0)
				.attr('y', 0)
				.attr('width', options.width)
				.attr('height', options.dataHeight + options.explorerHeight)
				.attr('class', options.cssClass)
		;

		this.viewver = timeline.viewver.build(this.svg, options.width, options.dataHeight, data, options.viewver ? options.viewver : {});
		this.explorer = timeline.explorer.build(this.svg, options.width, options.explorerHeight, this.viewver.laneLabelWidth, options.dataHeight, data, options.explorer ? options.explorer : {}).bind(this.viewver);

		this.display = function() {
			this.viewver.display();
			this.explorer.display();
		};

		return this.display();
	};

	timeline.getStart = function(data) {
		return moment.unix(d3.min(data, function(d) { return d.start; })).startOf('year').format('X');
	};

	timeline.getEnd = function(data) {
		var now = moment().format('X');
		return d3.max(data, function(d) { if (!d.end) d.end = now; return d.end; });
	};
})(d3);
