'use strict';

var TranslationController = ['$rootScope', '$scope', 'SidonieModalService', 'NotificationsService', function($rootScope, $scope, modalService, notificationsService) {
    var updateTranslation = function (translationKey, translationData) {
        translationData.key = translationKey;
        // I shamelessly stole this from js/default/translations.js
        $.ajax({
            url : BASE_URL + 'betty/translation/update',
            type:'post',
            dataType:'json',
            data : { translations : [translationData] },
            success : function(result) {
                if (typeof result.success != "undefined" && !result.success){
                    notificationsService.addError ({text: t("Oops ! Il y a eu un problème lors de la sauvegarde de cette traduction") });
                }
            }
        });
        notificationsService.addSuccess ({text: t("Modification prise en compte au prochain rechargement de la page") });
    }


    $scope.displayTranslationPopup = function (){
        modalService.open('right', 'translation.modal', {
            templateUrl: 'translationsEditor.phtml',
            controller: ['$scope', function($scope) {
                $scope.translationsList =evaneos.availableTranslations;
                $scope.updateTranslation = updateTranslation;
            }],
            backdrop: false
        });
    }
}];


angular.module('ev-fdm')
    .controller('TranslationController', TranslationController);
