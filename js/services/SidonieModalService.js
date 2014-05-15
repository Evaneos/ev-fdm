var module = angular.module('common.services');

var SidonieModalService = function($modal, $animate, $log) {

    // main object containing all opened modals
    var regions = {};
    regions[ SidonieModalService.REGION_RIGHT ] = { multi: false, opened: [ ] };
    regions[ SidonieModalService.REGION_MIDDLE ] = { multi: false, opened: [ ] };


    // --------------------------------------------------------
    // 'PUBLIC' FUNCTIONS
    // --------------------------------------------------------

    /**
     * Makes sure that:
     * - the current opened popup in that region is not locked for edition
     * - the current opened popup is not already of that type (in that case, do not open a new popup)
     *
     * @param  region
     * @param  modalType
     * @param  options
     * @return the modal instance if success, false if cancelled by a locked popup
     */
    function open(region, modalType, options) {
        var regionSpecs = getRegionSpecs(region);
        var isMulti = regionSpecs.multi;
        var openedModals = regionSpecs.opened;

        if (!options.windowClass) {
            options.windowClass = ' fade ';
        }
        options.windowClass += ' ' + region;
        if (!options.templateUrl && !options.template) {
            options.templateUrl = modalType + '.phtml';
        }

        options.backdrop = (region == SidonieModalService.REGION_MIDDLE);

        if (isMulti) {
            throw new Error('Multi not implemented yet');
        } else {
            if (openedModals.length) {
                var openedModal = openedModals[openedModals.length - 1];
                // current opened modal cannot be closed / updated
                if (openedModal.status == SidonieModalService.STATUS_LOCKED) {
                    $log.warn('Open modal aborted due to ' + openedModal.sidonieModalType + '\'s locked status');
                    highlightModal(openedModal);
                    return false;
                // current opened modal has to be replaced
                } else if (openedModal.sidonieModalType != modalType) {
                    // close and open a new one
                    openedModal.modal('hide');
                    var modal = $modal.open(options);
                    modal.sidonieModalType = modalType;
                    modal.result.finally(handleModalClosing(region, modal));
                    regionSpecs.opened = [ modal ];
                    return modal;
                // current opened modal can be kept and content updated
                } else {
                    return openedModal;
                }
            } else {
                // simply open a new popup
                var modal = $modal.open(options);
                modal.sidonieModalType = modalType;
                modal.result.finally(handleModalClosing(region, modal));
                regionSpecs.opened = [ modal ];
                return modal;
            }
        }
    }

    /**
     * Closes all currently opened modals, making sure
     * they are ALL not locked
     * @return true if success, locked popup if not
     */
    function closeAll() {
        // check if all popups are ready to be closed
        var cancelled = false;
        angular.forEach(regions, function(regionSpecs, region) {
            angular.forEach(regionSpecs.opened, function(modal) {
                if (cancelled) return;
                if (modal.status == SidonieModalService.STATUS_LOCKED) {
                    highlightModal(modal);
                    $log.warn('Open modal aborted due to ' + modal.sidonieModalType + '\'s locked status');
                    cancelled = modal;
                }
            });
        });
        if (cancelled) return cancelled;
        // actually close all the popups
        angular.forEach(regions, function(regionSpecs, region) {
            angular.forEach(regionSpecs.opened, function(modal) {
                try {
                    modal.close();
                } catch(e) {}
            });
        });
        return true;
    }

    /**
     * Returns the latest modal of that region
     */
    function get(region, modalType) {
        var regionSpecs = getRegionSpecs(region);
        if (regionSpecs.modals.length) {
            var modal = regionSpecs.modals[regionSpecs.modals.length - 1];
            if (!modalType || modal.sidonieModalType == modalType) {
                return modal;
            } else {
                return false;
            }
        }
    }

    // --------------------------------------------------------
    // 'PRIVATE' FUNCTIONS
    // --------------------------------------------------------

    function getRegionSpecs(region) {
        var regionSpecs = regions[region];
        if (typeof(regionSpecs) == 'undefined') {
            throw new Error('Unknown region ' + region);
        }
        return regionSpecs;
    }

    function handleModalClosing(region, modal) {
        return function(result) {
            var regionSpecs = getRegionSpecs(region);
            angular.forEach(regionSpecs.opened, function(_modal) {
                if (modal == _modal) {
                    regionSpecs.opened = _(regionSpecs.opened).without(modal);
                }
            });
        }
    }

    function highlightModal(modal) {
        $animate.addClass(modal, 'modal-locked', function() {
            $animate.removeClass(modal, 'modal-locked');
        });
    }

    return {
        open: open,
        openRight: function(modalType, options) {
            open(SidonieModalService.REGION_RIGHT, modalType, options);
        },
        openMiddle: function(modalType, options) {
            open(SidonieModalService.REGION_MIDDLE, modalType, options);
        },
        get: get,
        closeAll: closeAll
    }
}

SidonieModalService.STATUS_LOCKED = 'locked';
SidonieModalService.REGION_RIGHT = 'right';
SidonieModalService.REGION_MIDDLE = 'middle';


module.service('SidonieModalService', [ '$modal', '$animate', '$log', SidonieModalService ]);