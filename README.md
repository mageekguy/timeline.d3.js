# Timeline.d3.js

## A timeline made with d3.js and moment.js

![screenshot](/screenshot.png?raw=true)

Timeline.d3.js is based on http://bl.ocks.org/bunkat/2338034 but it's a completely new implementation.  

To use it, you should download:
* [d3.js](http://d3js.org/d3.v3.zip)
* [moment.js](https://rawgithub.com/timrwood/moment/2.1.0/min/moment.min.js)

After that, just link them and timeline.d3.js files in the `head` section of your html code:

```html
<script type="text/javascript" src="/url/of/d3.v3.min.js" charset="utf-8"></script>                                                                                                                                              
<script type="text/javascript" src="/url/of/moment.min.js"></script>
<script type="text/javascript" src="/url/of/timeline.d3.js"></script>
<link rel="stylesheet" href="/url/of/timeline.d3.css" type="text/css" media="screen" />
```

You can now generate your timeline with the following code in the `body` section of your html code:

```html
<body>
   <script type="text/javascript">
   var myTimeline = d3.timeline.build(
		[
			{'lane': 'The first lane', 'id': 'Event 1', 'start': 1180528176, 'end': 1188390576},
			{'lane': 'The first lane', 'id': 'Event 2', 'start': 1188390576, 'end': 1194442176},
			{'lane': 'The third lane', 'id': 'Event 1', 'start': 1194442176, 'end': 1209558576}
		],
		'body'
	);
   </script>
</body>
```

Read the file `index.hml` in the repository for more informations.
