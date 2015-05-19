(function(bld, $, undefined)
{

	bld.dict = {}

	oswin.config.namespace = bld;
	oswin.config.binds = [
			['.focus', 'init/focus'],
		];


	function shuffle(array)
	{
		for (var i = array.length; i > 0;)
		{
			r = Math.floor(Math.random() * i);
			i--;
			var tmp = array[i];
			array[i] = array[r];
			array[r] = tmp;
		}
	}


	function Cube3()
	{
		this.edges = new Array(12);
		this.corners = new Array(8);
	}

	Cube3.prototype.setScheme = function(scheme)
	{
		this.edges[0] =  [ scheme[0],  scheme[16] ];
		this.edges[1] =  [ scheme[1],  scheme[12] ];
		this.edges[2] =  [ scheme[2],  scheme[8]  ];
		this.edges[3] =  [ scheme[3],  scheme[4]  ];
		this.edges[4] =  [ scheme[19], scheme[13] ];
		this.edges[5] =  [ scheme[15], scheme[9]  ];
		this.edges[6] =  [ scheme[11], scheme[5]  ];
		this.edges[7] =  [ scheme[7],  scheme[17] ];
		this.edges[8] =  [ scheme[22], scheme[18] ];
		this.edges[9] =  [ scheme[21], scheme[14] ];
		this.edges[10] = [ scheme[20], scheme[10] ];
		this.edges[11] = [ scheme[23], scheme[6]  ];

		this.corners[0] = [ scheme[0],  scheme[4],  scheme[17] ];
		this.corners[1] = [ scheme[1],  scheme[13], scheme[16] ];
		this.corners[2] = [ scheme[2],  scheme[9],  scheme[12] ];
		this.corners[3] = [ scheme[3],  scheme[8],  scheme[5]  ];
		this.corners[4] = [ scheme[23], scheme[7],  scheme[18] ];
		this.corners[5] = [ scheme[22], scheme[14], scheme[19] ];
		this.corners[6] = [ scheme[21], scheme[15], scheme[10] ];
		this.corners[7] = [ scheme[20], scheme[11], scheme[6]  ];
	};

	Cube3.prototype.shuffle = function()
	{
		shuffle(this.edges);
		shuffle(this.corners);

		var edges = this.edges.reduce(function(acc, val, i)
		{
			var r = Math.floor(Math.random() * 2);
			return acc + val[r] + (i % 2 == 0 ? '' : ' ');
		}, '');

		var corners = this.corners.reduce(function(acc, val, i)
		{
			var r = Math.floor(Math.random() * 3);
			return acc + val[r] + (i % 2 == 0 ? '' : ' ');
		}, '');

		return [edges, corners];
	};


	$(document).ready(function()
	{
		var App = oswin.model({
			url: { read: 'bldTrainer' },

			data: {
				scheme: 'ABCDEFGHIJKLMNOPQRSTUVWX',
				_edges: '-',
				_corners: '-',
				dictRegExp: '^a.*b',
				_dictResults: '',
				_dictResultsNum: 0
			},

			members: {
				dictLoaded: false,
				cube3: new Cube3(),

				setScheme: function(scheme)
				{
					if (scheme === undefined) this.data.scheme = 'ABCDEFGHIJKLMNOPQRSTUVWX';
					else this.data.scheme = scheme;
					this.update();
				},

				genPairs: function()
				{
					oswin.event.preventDefault();

					this.cube3.setScheme(this.data.scheme);
					var sh = this.cube3.shuffle();
					this.data._edges = sh[0];
					this.data._corners = sh[1];
				},

				dictFilter: function()
				{
					oswin.event.preventDefault();
					this.data._dictResults = '';
					this.data._dictResultsNum = 0;

					var re;
					try { re = new RegExp(this.data.dictRegExp, 'i'); }
					catch (e)
					{
						this.data._dictResults = "Neplatný regulární výraz\n"+e;
						return;
					}

					this.update();

					if (!this.dictLoaded)
					{
						this.data._dictResults = 'Slovník ještě není načten...';
						return;
					}

					var num = 0;
					var cap = 4096;
					var ret = bld.dict.filter(function(e)
					{
						if (re.test(e) && num < cap)
						{
							num++;
							return true;
						}
						else return false;
					});
					ret.sort(function(a, b) { return a.length - b.length; });
					var ret_str = '';
					for (var i = 0, l = ret.length; i < l; i++) ret_str += ret[i] + "\n";
					if (num >= cap) ret_str += "...příliš mnoho výsledků, končím.\n";
					this.data._dictResultsNum = num;
					this.data._dictResults = ret_str;
				},

				regexpDemo: function()
				{
					this.data._dictResults = ""+
					"^a.*b   - slova začínající na písmeno A a obsahující písmeno B\n"+
					"^ab     - slova začínající na AB\n"+
					"^a.*b$  - slova začínající na A a končící na B\n"+
					"ab      - slova obsahující AB (těsně zasebou)\n"+
					"a.*b    - slova obsahující A a někde za ním B\n"+
					"[ab]    - slova obsahující A a/nebo B\n"+
					"\nPozn: hledání nerozlišuje malá a velká písmena"
				},

				loadDict: function()
				{
					var self = this;
					$.getJSON('dict/csNouns.json', function(data)
					{
						bld.dict = data;
						self.dictLoaded = true;
					});
				}
			},

			on: {
				'mod:scheme': function() { this.update(); }
			}
		});

		App.sync = oswin.localSync;

		var app = App.make();
		bld.app = app;
		app.view('view');
		app.loadDict();
		app.get();
	});

}(window.bld = window.bld || {}, jQuery));
