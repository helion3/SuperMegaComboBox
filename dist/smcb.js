(function() {
    'use strict';

    // Instantiate the module. Look ma, no deps!
    var module = angular.module('ui.superMegaComboBox', []);

    // Preload the cache
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('smcb/combobox.html', '<div class="input-group"> \
                <input \
                    class="form-control" \
                    ng-disabled="disabled" \
                    ng-focus="!config.openOnFocus || open()" \
                    ng-model="model.value" \
                    ng-keyup="update(this)"> \
                <span class="input-group-btn"> \
                    <button class="btn icon icon-down-arrow" ng-click="toggle()" ng-disabled="disabled" type"button">&nbsp;</button> \
                </span> \
            </div> \
            <ul class="dropdown-menu ui-smcb-dropdown" ng-show="isOpen" ng-transclude></ul>');

        $templateCache.put('smcb/option.html', '<li \
            class="ui-smcb-option" \
            ng-class="{ selected: isSelected(this) }"> \
            <a ng-click="click(this)" ng-transclude></a></li>');
    }]);

    // Create a configuration provider users can inject during a config phase
    module.provider('smComboBoxConfig', function() {
        var config = this;

        // Append UL to the document body, if overflow is an issue
        config.appendToBody = false;

        // Close the menu if a click occurs outside
        config.closeOnDocumentClick = true;

        // Dropdown width may be driven by the input's
        config.matchInputWidth = true;

        // Open the menu on input focus
        config.openOnFocus = false;

        // Ignore me I'm the getter
        config.$get = function () {
            return config;
        };
    });

    module.directive('smCombobox', [
        '$parse',
        '$rootScope',
        '$timeout',
        'smComboBoxConfig',
    function($parse, $rootScope, $timeout, config) {
        return {
            require: ['smCombobox', 'ngModel'],
            restrict: 'EA',
            templateUrl: 'smcb/combobox.html',
            transclude: true,
            scope: {
                disabled: '=ngDisabled',
                isOpen: '=?',
                ngModel: '=',
                ngRequired: '=',
                value: '='
            },
            link: function(scope, $element, attrs, ctrls) {
                var ctrl = ctrls[0];

                // Allow easier access to ngModel
                ctrl.ngModel = ctrls[1];

                // Parse which property the user wants us to use
                ctrl.parseDisplayProperty = function(obj) {
                    return typeof obj === 'object' ? $parse(attrs.value)(obj) : obj;
                };

                // Assign scope values
                scope.config = config;
                scope.model = {
                    value: undefined
                };

                // Sync internal model with the external one
                // This allows the user to use objects rather than strings if they want
                scope.$watch('ngModel', function(val) {
                    scope.model.value = ctrl.parseDisplayProperty(val);
                });

                // Update the original model with internal changes
                scope.update = function() {
                    ctrl.ngModel.$setViewValue(scope.model.value);
                };

                // ~~@@ ----------- @@~~
                //      DOM Logic
                // ~~@@ ----------- @@~~

                // Cache elements
                var $input = $element.find('input');
                var $inputGroup = $element.find('div');
                var $list = $element.find('ul');

                // Set classes
                $element.addClass('ui-smcb');

                // Append to body
                if (config.appendToBody) {
                    $timeout(function() {
                        $list[0].parentNode.removeChild($list[0]);
                        angular.element(document.body).append($list);
                    });
                }

                // ~~@@ ----------- @@~~
                //     Width Calcs
                // ~~@@ ----------- @@~~

                // Match widths
                function reWidth() {
                    if (config.matchInputWidth) {
                        $list.css('width', $inputGroup[0].offsetWidth + 'px');
                    }
                };

                // Initialize
                $timeout(reWidth);

                // Watch input resizes
                if (config.matchInputWidth) {
                    angular.element(window).on('resize', function() {
                        // @todo debounce
                        reWidth();
                    });
                }

                // ~~@@ ----------- @@~~
                //   Positioning Logic
                // ~~@@ ----------- @@~~

                // Move ul to body
                if (config.appendToBody) {
                    var rect = $input[0].getBoundingClientRect();
                    $list.css({
                        left: rect.left + 'px',
                        top: rect.top + $input[0].offsetHeight + 'px'
                    });
                }

                // ~~@@ ----------- @@~~
                //    Click Handling
                // ~~@@ ----------- @@~~

                // Prevent document clicks when they're really ours
                $element.on('click', function(event) {
                    event.stopPropagation();
                });

                // Close menu on document click
                if (config.closeOnDocumentClick) {
                    angular.element(document).on('click', function(event) {
                        scope.close();
                        $rootScope.$digest();
                    });
                }
            },
            controller: ['$scope', function($scope) {
                var ctrl = this;

                // Close the menu
                $scope.close = function() {
                    $scope.isOpen = false;
                }

                // Open the menu
                $scope.open = function() {
                    if (!$scope.disabled) {
                        $scope.isOpen = true;
                    }
                }

                // Toggle menu's visibility
                $scope.toggle = function() {
                    $scope.isOpen = !$scope.isOpen;
                }

                // Select an option
                ctrl.select = function(option) {
                    ctrl.ngModel.$setViewValue(option);
                    ctrl.ngModel.$setTouched();

                    $scope.close();
                };
            }]
        }
    }]);

    module.directive('smComboboxOption', [
        'smComboBoxConfig',
    function(config) {
        var keyword;
        return {
            require: '^smCombobox',
            restrict: 'EA',
            replace: true,
            templateUrl: 'smcb/option.html',
            transclude: true,
            link: function(scope, $element, attrs, ctrl) {
                var getProperty = function() {
                    // @todo needs to be smarter, support "for"
                    return attrs.ngRepeat.split(' ')[0];
                };

                scope.click = function(option) {
                    ctrl.select(option[getProperty()]);
                }

                scope.isSelected = function(option) {
                    var val = option[getProperty()];

                    return ctrl.parseDisplayProperty(ctrl.ngModel.$viewValue) === ctrl.parseDisplayProperty(val);
                }
            }
        }
    }]);
}());
