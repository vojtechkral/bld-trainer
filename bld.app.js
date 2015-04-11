(function(bld, $, undefined)
{

	bld.dict = {}

	function haveLocalStorage()
	{
		try { return 'localStorage' in window && window['localStorage'] !== null; }
		catch (e) { return false; }
	}


	oswin.config.namespace = bld;
	oswin.config.binds = [
			['.focus', 'init/focus'],
		];

	$(document).ready(function()
	{
		var mApp = oswin.model({
			data: {
				scheme: 'ABCDEFGHIJKLMNOPQRSTUVWX',
				pair: '__',
				dictRegExp: '',
				dictResults: '',
				dictResultsNum: 0
			},

			members: {
				ctor: function()
				{
					this.haveLocalStorage = haveLocalStorage();
					if (this.haveLocalStorage)
					{
						if ('scheme' in localStorage) this.data.scheme = localStorage.scheme;
					}

					this.dictLoaded = false;
				},

				setScheme: function(scheme)
				{
					if (scheme === undefined) this.data.scheme = 'ABCDEFGHIJKLMNOPQRSTUVWX';
					else this.data.scheme = scheme;
				},

				genPair: function()
				{
					oswin.event.preventDefault();

					var scheme = this.data.scheme;
					var r1 = Math.floor(Math.random() * scheme.length);
					var r2 = r1;
					while (r2 == r1) r2 = Math.floor(Math.random() * scheme.length);

					this.data.pair = scheme[r1] + scheme[r2];
				},

				dictFilter: function()
				{
					oswin.event.preventDefault();
					this.data.dictResults = '';

					if (!this.dictLoaded)
					{
						this.data.dictResults = 'Slovník ještě není načten...';
						return;
					}

					var re;
					try { re = new RegExp(this.data.dictRegExp, 'i'); }
					catch (e) {
						this.data.dictResults = "Neplatný regulární výraz\n"+e;
						return;
					}

					var dict = bld.dict;
					var num = 0;
					var cap = 4096;
					for (var i = 0, l = dict.length; i < l; i++)
					{
						if (re.test(dict[i]))
						{
							this.data.dictResults += dict[i] + "\n";
							num++
							if (num >= cap)
							{
								this.data.dictResults += "...příliš mnoho výsledků, končím.\n";
								break;
							}
						}
					}
					this.data.dictResultsNum = num;
				},

				regexpDemo: function()
				{
					this.data.dictResults = ""+
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

			change: {
				scheme: function(value, name)
				{
					if (this.haveLocalStorage) localStorage.scheme = this.data.scheme;
				}
			}
		});

		var app = mApp.make();
		bld.app = app;
		app.view('view');
		app.loadDict();
	});

}(window.bld = window.bld || {}, jQuery));
