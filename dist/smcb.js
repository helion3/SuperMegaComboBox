(function() {
    'use strict';

    // Instantiate the module. Look ma, no deps!
    var module = angular.module('ui.superMegaComboBox', []);

    // Preload the cache
    module.run(['$templateCache', function($templateCache) {
        $templateCache.put('smcb/combobox.html', '<div class="input-group"> \
                <input \
                    class="form-control" \
                    ng-focus="!comboxConfig.openOnFocus || open()" \
                    ng-model="model.value"> \
                <span class="input-group-btn"> \
                    <button class="btn" ng-click="toggle()" type"button">^</button> \
                </span> \
            </div> \
            <ul class="dropdown-menu ui-smcb-dropdown" ng-show="isOpen" ng-transclude></ul>');

        $templateCache.put('smcb/option.html', '<li \
            class="ui-smcb-option" \
            ng-class="{ selected: $ctrl.ngModel.$viewValue === $ctrl.parseDisplayProperty(this) }"> \
            <a ng-click="$ctrl.select($ctrl.parseDisplayProperty(this))" ng-transclude></a></li>');
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
                isOpen: '=?',
                ngRequired: '=',
                value: '='
            },
            link: function(scope, $element, attrs, ctrls) {
                var ctrl = ctrls[0];
                var ngModel = ctrls[1];

                // Allow ngModel to be proxied
                ctrl.ngModel = ngModel;

                // Parse which property the user wants us to use
                ctrl.parseDisplayProperty = function(obj) {
                    return $parse(attrs.value)(obj);
                };

                $element.addClass('ui-smcb');

                // Share config with the scope
                scope.comboxConfig = config;

                // Use an internal model
                scope.model = {
                    value: undefined
                };

                // Sync internal model with the external one
                ctrl.syncModel = function() {
                    scope.model.value = ngModel.$viewValue;
                };

                // Auto-invoke once after the models have loaded
                $timeout(function() {
                    ctrl.syncModel();
                });

                // Cache elements
                var $input = $element.find('input');
                var $inputGroup = $element.find('div');
                var $list = $element.find('ul');

                // Move list to the body
                if (config.appendToBody) {
                    $timeout(function() {
                        $list[0].parentNode.removeChild($list[0]);
                        angular.element(document.body).append($list);
                    });
                }

                // Match widths
                function reWidth() {
                    if (config.matchInputWidth) {
                        $list.css('width', $inputGroup[0].offsetWidth + 'px');
                    }
                };

                $timeout(function() {
                    reWidth();
                });

                $input.on('blur', function() {
                    ctrl.select($input[0].value);
                    $rootScope.$digest();
                });

                // Watch input resizes
                if (config.matchInputWidth) {
                    angular.element(window).on('resize', function() {
                        // @todo debounce
                        reWidth();
                    });
                }

                // Position
                if (config.appendToBody) {
                    var rect = $input[0].getBoundingClientRect();
                    $list.css({
                        left: rect.left + 'px',
                        top: rect.top + $input[0].offsetHeight + 'px'
                    });
                }

                // Prevent document clicks when they're really ours
                $element.on('click', function(event) {
                    event.stopPropagation();
                });

                // Close menu on document click
                if (config.closeOnDocumentClick) {
                    angular.element(document).on('click', function(event) {
                        scope.isOpen = false;
                        $rootScope.$digest();
                    });
                }
            },
            controller: ['$scope', function($scope) {
                var ctrl = this;

                // Proxy ngModel
                $timeout(function() {
                    $scope.ngModel = ctrl.ngModel;
                });

                // Close the menu
                $scope.close = function() {
                    $scope.isOpen = false;
                }

                // Open the menu
                $scope.open = function() {
                    $scope.isOpen = true;
                }

                // Toggle menu's visibility
                $scope.toggle = function() {
                    $scope.isOpen = !$scope.isOpen;
                }

                // Select an option
                ctrl.select = function(val) {
                    ctrl.ngModel.$setViewValue(val);
                    ctrl.ngModel.$setTouched();

                    ctrl.syncModel();

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
                scope.$ctrl = ctrl;
            }
        }
    }]);
}());
