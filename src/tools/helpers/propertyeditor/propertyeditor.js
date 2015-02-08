
define([], function () {
  var widgetPerType = {
    'object': PropertyList,
    'string': StringInput,
    'number': NumericInput,
    'bool'  : CheckBox,
    'array' : IndexList,
    'circular': CircularLink
  };

  function PropertyEditor(obj, name) {
    this._visited = [];
    this._name = name || 'object';
    this._context = {};
    this._context[this._name] = obj;
  }

  PropertyEditor.prototype.getElement = function () {
    if (!this._editor) { this._buildEditor(); }
    return this._editor;
  };

  PropertyEditor.prototype._buildEditor = function () {
    this._editor = this._widgetFor(this._context, this._name);
  };

  PropertyEditor.prototype._widgetFor = function (context, property) {
    var value = context[property];
    var isReference =
      value && (typeof value === 'object' || typeof value === 'function');
    var type = Array.isArray(value) ? 'array' : typeof value;
    var isVisited = isReference && this._visited.indexOf(value) > -1;
    if (isVisited) { type = 'circular'; }
    else { this._visited.push(value); }
    var widget = widgetPerType[type] ?
                 widgetPerType[type].call(this, context, property) :
                 null;
    if (isReference && !isVisited) { // was visited
      value.__widget = widget; // XXX: maps are welcome, to avoid this sh*t
      this._visited.push(value);
    }
    return widget;
  };

  function CheckBox(root, property) {
    var checkbox = document.createElement('INPUT');
    checkbox.type = 'checkbox';
    checkbox.onclick = function () {
      root[property] = this.checked;
    };
    checkbox.checked = root[property];
    return checkbox;
  }

  function StringInput(root, property) {
    var input = document.createElement('INPUT');
    input.onblur = function () {
      root[property] = this.value;
    };
    input.value = root[property];
    return input;
  }

  function NumericInput(root, property) {
    var input = document.createElement('INPUT');
    input.type = 'number';
    input.onblur = function () {
      root[property] = parseFloat(this.value);
    };
    input.value = root[property];
    return input;
  }

  function PropertyList(root, property) {
    var item, label, widget;
    var list = document.createElement('UL');
    var obj = root[property];
    for (var name in obj) {
      widget = this._widgetFor(obj, name);
      if (widget) {
        item = document.createElement('LI');
        label = document.createElement('LABEL');
        label.textContent = name;
        label.onclick = widget.focus.bind(widget);

        item.appendChild(label);
        item.appendChild(widget);
        list.appendChild(item);
      }
    }
    return list;
  }

  function IndexList(root, property) {
    var item, label, widget;
    var list = document.createElement('UL');
    var array = root[property];
    for (var index = 0, l = array.length; index < l; index++) {
      widget = this._widgetFor(array, index);
      if (widget) {
        item = document.createElement('LI');
        label = document.createElement('LABEL');
        label.textContent = index;
        label.onclick = widget.focus.bind(widget);

        item.appendChild(label);
        item.appendChild(widget);
        list.appendChild(item);
      }
    }
    return list;
  }

  function CircularLink(root, property) {
    var a = document.createElement('A');
    a.href = '#';
    a.textContent = 'Circular link';
    var index = this._visited.indexOf(root[property]);
    var widget = this._visited[index];
    a.onclick = function () {
      document.scrollTo(widget);
      widget.focus();
    };
    return a;
  }

  return PropertyEditor;
});
