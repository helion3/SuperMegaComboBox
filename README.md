# Angular SuperMegaComboBox

A non-terrible ComboBox (and more!) component for Angular 1.5+ and Bootstrap 3.

# Features

- Configurable.
- Supports `ngModel`, `ngRequired`, `ngDisabled`, etc.
- Works with an array of strings or objects.
- Transcludes your html for select list options.

# Basics

Require smcb as a module dependency:

```
angular.module('yourModule', ['ui.superMegaComboBox']);
```

Define the form field with a `ngModel` and a `value`, a list of options.

```
<sm-combobox ng-model="model.state" value="state">
    <sm-combobox-option ng-repeat="state in states"><span ng-bind="state"></span></sm-combobox-option>
</sm-combobox>
```

# Configuration

In your configuration phase, you can set config options on the provider:

```
app.config(['smComboBoxConfigProvider', function(smComboBoxConfigProvider) {
    smComboBoxConfigProvider.openOnFocus = true;
}]);
```

### Options

- `appendToBody` - (Default: false) - Append the menu to the body, in case you have overflow limitations.
- `closeOnDocumentClick` - (Default: true) - Close the menu when a click occurs outside it.
- `matchInputWidth` - (Default: true) - Sets the menu width to the same as the input.
- `openOnFocus` - (Default: false) - Opens immediately when the textbox is focused.

# TODO
- config option to require entered text to match an option
- typeahead functionality
- allow configs as attributes too, for per-instance config

(c) 2016, A [Helion3](http://helion3.com) thang.
