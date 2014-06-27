@import "variables.less";
@import "vendors.less";
@import "layout/index.less";
@import "common/index.less";
// Sidonie + Bootstrap Variables
// --------------------------------------------------

// Paths
// --------------------------------------------------
@path-root:        '../../..'; // The root path that should be used for exposed dependencies (PNGs...)
@path-images:      '/images/lisette/';
@path-fonts:       'fonts';

// Global values
// --------------------------------------------------

@menu-height: 29px;
@viewport-min-width: 992px;
@searchbar-width: 260px;
@searchbar-width-max: 360px;
@layout-gutter: 3px;
@animation-duration: 0.2s;

// Grays
// -------------------------

@gray-darker: #302a25;
@gray-dark: #534840;
@gray: #A5907C;
@gray-light: #E5D8CA;
@gray-lighter: #F4EBE6;

// Brand colors
// -------------------------

@brand-primary: #00A79D;           // turquoise
@brand-green: #72AB49;             // green
@brand-success: @brand-green;      // green
@brand-warning: #f79400;           // jaune-orange
@brand-warning-light: #f0ad4e;     // jaune-orange bright
@brand-danger: #ef6e45;            // orange
@brand-info: #6aabde;              // blue
@brand-evaneos: @brand-primary;    // turquoise
@brand-secondary: @brand-warning;  // jaune-orange
@brand-red: #CD0018;               // red
@brand-purple: #662D91;            // purple

// Scaffolding
// -------------------------

@body-bg: #fff;
@text-color: @gray-darker;
@link-color: @brand-primary;
@link-hover-color: darken(@link-color, 15%);

// Typography
// -------------------------

@font-family-sans-serif:  "Droid Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
@font-family-serif:       "Droid Serif", Georgia, "Times New Roman", Times, serif;
@font-family-monospace:   Monaco, Menlo, Consolas, "Courier New", monospace;
@font-family-base:        @font-family-sans-serif;

@font-size-base:          14px;
@font-size-large:         ceil(@font-size-base * 1.25); // ~18px
@font-size-small:         ceil(@font-size-base * 0.85); // ~12px

@line-height-base:        1.428571429; // 20/14
@line-height-computed:    floor(@font-size-base * @line-height-base); // ~20px

@headings-font-family:    @font-family-base;
@headings-font-weight:    500;
@headings-line-height:    1.1;

// Iconography
// -------------------------

@icon-font-path:          "/fonts/bootstrap/";
@icon-font-name:          "glyphicons-halflings-regular";


// Components
// -------------------------
// Based on 14px font-size and 1.428 line-height (~20px to start)

@padding-base-vertical: 6px;
@padding-base-horizontal: 15px;
@padding-large-vertical: 8px;
@padding-large-horizontal: 18px;
@padding-small-vertical: 5px;
@padding-small-horizontal: 12px;
@line-height-large:              1.33;
@line-height-small:              1.5;
@border-radius-base: 3px;
@border-radius-large: 5px;
@border-radius-small: 3px;

@component-active-bg: @gray-lighter;

@caret-width-base:               4px;
@caret-width-large:              5px;

// Tables
// -------------------------

@table-cell-padding:                 8px;
@table-condensed-cell-padding:       5px;

@table-bg:                           transparent; // overall background-color
@table-bg-accent:                    @gray-light; // for striping
@table-bg-hover:                     @gray-lighter;
@table-bg-active:                    @table-bg-hover;

@table-border-color:                 @gray-light; // table and cell border


// Buttons
// -------------------------
//
@btn-font-weight: normal;

@btn-default-color: @gray-dark;
@btn-default-bg: @gray-light;
@btn-default-border: @gray-light;

@btn-primary-color: #fff;
@btn-primary-bg: @brand-primary;
@btn-primary-border: darken(@btn-primary-bg, 5%);

@btn-success-color: #fff;
@btn-success-bg: @brand-success;
@btn-success-border: darken(@btn-success-bg, 5%);

@btn-warning-color: #fff;
@btn-warning-bg: @brand-warning;
@btn-warning-border: darken(@btn-warning-bg, 5%);

@btn-danger-color: #fff;
@btn-danger-bg: @brand-danger;
@btn-danger-border: darken(@btn-danger-bg, 5%);

@btn-info-color: #fff;
@btn-info-bg: @brand-info;
@btn-info-border: darken(@btn-info-bg, 5%);

@btn-link-disabled-color: @gray-light;



// Forms
// -------------------------

@input-bg:                       #fff;
@input-bg-disabled:              @gray-lighter;

@input-color:                    @gray-darker;
@input-border:                   @gray-light;
@input-border-radius:            @border-radius-base;
@input-border-focus:             @gray;

@input-color-placeholder:        @gray;

@input-height-base:              (@line-height-computed + (@padding-base-vertical * 2) + 2);
@input-height-large:             (floor(@font-size-large * @line-height-large) + (@padding-large-vertical * 2) + 2);
@input-height-small:             (floor(@font-size-small * @line-height-small) + (@padding-small-vertical * 2) + 2);

@legend-color:                   @gray-dark;
@legend-border-color:            #e5e5e5;

@input-group-addon-bg:           @gray-lighter;
@input-group-addon-border-color: @input-border;


// Dropdowns
// -------------------------
@dropdown-bg: #fff;
@dropdown-border: @gray-light;
@dropdown-divider-bg: @gray-light;
@dropdown-link-active-color: @gray-dark;
@dropdown-link-active-bg: @component-active-bg;
@dropdown-link-color: @gray-dark;
@dropdown-link-hover-color: @gray-dark;
@dropdown-link-hover-bg: @dropdown-link-active-bg;
@dropdown-link-disabled-color: @gray-light;
@dropdown-header-color: @gray-light;
@dropdown-caret-color: @gray-dark;
@dropdown-fallback-border: @gray-light;


// COMPONENT VARIABLES
// --------------------------------------------------


// Z-index master list
// -------------------------
// Used for a bird's eye view of components dependent on the z-axis
// Try to avoid customizing these :)

@zindex-navbar:            1000;
@zindex-dropdown:          1000;
@zindex-popover:           1010;
@zindex-tooltip:           1030;
@zindex-navbar-fixed:      1030;
@zindex-modal-background:  1040;
@zindex-modal:             1050;

// Media queries breakpoints
// --------------------------------------------------

// Extra small screen / phone
@screen-xs:                  480px;
@screen-phone:               @screen-xs;

// Small screen / tablet
@screen-sm:                  768px;
@screen-tablet:              @screen-sm;

// Medium screen / desktop
@screen-md:                  992px;
@screen-desktop:             @screen-md;

// Large screen / wide desktop
@screen-lg:                  1200px;
@screen-lg-desktop:          @screen-lg;

// So media queries don't overlap when required, provide a maximum
@screen-xs-max:              (@screen-sm - 1);
@screen-sm-max:              (@screen-md - 1);
@screen-md-max:              (@screen-lg - 1);


// Grid system
// --------------------------------------------------

// Number of columns in the grid system
@grid-columns:              12;
// Padding, to be divided by two and applied to the left and right of all columns
@grid-gutter-width:         30px;
// Point at which the navbar stops collapsing
@grid-float-breakpoint:     @screen-tablet;


// Navbar
// -------------------------

// Basics of a navbar
@navbar-height:                    50px;
@navbar-margin-bottom:             @line-height-computed;
@navbar-default-color:             #777;
@navbar-default-bg:                #f8f8f8;
@navbar-default-border:            darken(@navbar-default-bg, 6.5%);
@navbar-border-radius:             @border-radius-base;
@navbar-padding-horizontal:        floor(@grid-gutter-width / 2);
@navbar-padding-vertical:          ((@navbar-height - @line-height-computed) / 2);

// Navbar links
@navbar-default-link-color:                #777;
@navbar-default-link-hover-color:          #333;
@navbar-default-link-hover-bg:             transparent;
@navbar-default-link-active-color:         #555;
@navbar-default-link-active-bg:            darken(@navbar-default-bg, 6.5%);
@navbar-default-link-disabled-color:       #ccc;
@navbar-default-link-disabled-bg:          transparent;

// Navbar brand label
@navbar-default-brand-color:               @navbar-default-link-color;
@navbar-default-brand-hover-color:         darken(@navbar-default-link-color, 10%);
@navbar-default-brand-hover-bg:            transparent;

// Navbar toggle
@navbar-default-toggle-hover-bg:           #ddd;
@navbar-default-toggle-icon-bar-bg:        #ccc;
@navbar-default-toggle-border-color:       #ddd;


// Inverted navbar
//
// Reset inverted navbar basics
@navbar-inverse-color:                      #F3F3F3;
@navbar-inverse-bg:                         @brand-evaneos;
@navbar-inverse-border:                     @brand-evaneos;

// Inverted navbar links
@navbar-inverse-link-color:                 darken(@navbar-inverse-bg, 20%);
@navbar-inverse-link-hover-color:           @navbar-inverse-link-color;
@navbar-inverse-link-hover-bg:              transparent;
@navbar-inverse-link-active-color:          #FFF;
@navbar-inverse-link-active-bg:             transparent;
@navbar-inverse-link-disabled-color:        darken(@navbar-inverse-bg, 10%);
@navbar-inverse-link-disabled-bg:           transparent;

// Inverted navbar brand label
@navbar-inverse-brand-color:                #fff;
@navbar-inverse-brand-hover-color:          #fff;
@navbar-inverse-brand-hover-bg:             transparent;

// Inverted navbar search
// Normal navbar needs no special styles or vars
@navbar-inverse-search-bg:                  lighten(@navbar-inverse-bg, 25%);
@navbar-inverse-search-bg-focus:            #fff;
@navbar-inverse-search-border:              @navbar-inverse-bg;
@navbar-inverse-search-placeholder-color:   @gray;

// Inverted navbar toggle
@navbar-inverse-toggle-hover-bg:            #333;
@navbar-inverse-toggle-icon-bar-bg:         #fff;
@navbar-inverse-toggle-border-color:        #333;


// Navs
// -------------------------

@nav-link-padding:                          10px 15px;
@nav-link-hover-bg:                         @gray-lighter;

@nav-disabled-link-color:                   @gray-light;
@nav-disabled-link-hover-color:             @gray-light;

@nav-open-link-hover-color:                 #fff;
@nav-open-caret-border-color:               #fff;

// Tabs
@nav-tabs-border-color:                     #ddd;

@nav-tabs-link-hover-border-color:          @gray-lighter;

@nav-tabs-active-link-hover-bg:             @body-bg;
@nav-tabs-active-link-hover-color:          @gray;
@nav-tabs-active-link-hover-border-color:   #ddd;

@nav-tabs-justified-link-border-color:            #ddd;
@nav-tabs-justified-active-link-border-color:     @body-bg;

// Pills
@nav-pills-active-link-hover-bg:            @component-active-bg;
@nav-pills-active-link-hover-color:         #fff;


// Pagination
// -------------------------

@pagination-bg:                        #fff;
@pagination-border:                    transparent;

@pagination-hover-bg:                  @gray-lighter;

@pagination-active-bg:                 @gray-light;
@pagination-active-color:              @gray-dark;

@pagination-disabled-color:            @gray-light;


// Pager
// -------------------------

@pager-border-radius:                  15px;
@pager-disabled-color:                 @gray-light;


// Jumbotron
// -------------------------

@jumbotron-padding:              30px;
@jumbotron-color:                inherit;
@jumbotron-bg:                   @gray-lighter;

@jumbotron-heading-color:        inherit;


// Form states and alerts
// -------------------------

@state-warning-text:             #c09853;
@state-warning-bg:               #fcf8e3;
@state-warning-border:           darken(spin(@state-warning-bg, -10), 3%);

@state-danger-text:              @brand-danger;
@state-danger-bg:                #f2dede;
@state-danger-border:            darken(spin(@state-danger-bg, -10), 3%);

@state-success-text:             #468847;
@state-success-bg:               #dff0d8;
@state-success-border:           darken(spin(@state-success-bg, -10), 5%);

@state-info-text:                #3a87ad;
@state-info-bg:                  #d9edf7;
@state-info-border:              darken(spin(@state-info-bg, -10), 7%);


// Tooltips
// -------------------------
@tooltip-max-width:           200px;
@tooltip-color:               #fff;
@tooltip-bg:                  #000;

@tooltip-arrow-width:         5px;
@tooltip-arrow-color:         @tooltip-bg;


// Popovers
// -------------------------
@popover-bg:                          #fff;
@popover-max-width:                   276px;
@popover-border-color:                rgba(0,0,0,.2);
@popover-fallback-border-color:       #ccc;

@popover-title-bg:                    darken(@popover-bg, 3%);

@popover-arrow-width:                 10px;
@popover-arrow-color:                 #fff;

@popover-arrow-outer-width:           (@popover-arrow-width + 1);
@popover-arrow-outer-color:           rgba(0,0,0,.25);
@popover-arrow-outer-fallback-color:  #999;


// Labels
// -------------------------

@label-default-bg:            @gray-light;
@label-primary-bg:            @brand-primary;
@label-success-bg:            @brand-success;
@label-info-bg:               @brand-info;
@label-warning-bg:            @brand-warning;
@label-danger-bg:             @brand-danger;

@label-color:                 #fff;
@label-link-hover-color:      #fff;


// Modals
// -------------------------
@modal-inner-padding:         20px;

@modal-title-padding:         15px;
@modal-title-line-height:     @line-height-base;

@modal-content-bg:                             #fff;
@modal-content-border-color:                   rgba(0,0,0,.2);
@modal-content-fallback-border-color:          #999;

@modal-backdrop-bg:           #000;
@modal-header-border-color:   #e5e5e5;
@modal-footer-border-color:   @modal-header-border-color;


// Alerts
// -------------------------
@alert-padding:               15px;
@alert-border-radius:         @border-radius-base;
@alert-link-font-weight:      bold;

@alert-success-bg:            @state-success-bg;
@alert-success-text:          @state-success-text;
@alert-success-border:        @state-success-border;

@alert-info-bg:               @state-info-bg;
@alert-info-text:             @state-info-text;
@alert-info-border:           @state-info-border;

@alert-warning-bg:            @state-warning-bg;
@alert-warning-text:          @state-warning-text;
@alert-warning-border:        @state-warning-border;

@alert-danger-bg:             @state-danger-bg;
@alert-danger-text:           @state-danger-text;
@alert-danger-border:         @state-danger-border;


// Progress bars
// -------------------------
@progress-bg:                 #f5f5f5;
@progress-bar-color:          #fff;

@progress-bar-bg:             @brand-primary;
@progress-bar-success-bg:     @brand-success;
@progress-bar-warning-bg:     @brand-warning;
@progress-bar-danger-bg:      @brand-danger;
@progress-bar-info-bg:        @brand-info;


// List group
// -------------------------
@list-group-bg:               #fff;
@list-group-border:           #ddd;
@list-group-border-radius:    @border-radius-base;

@list-group-hover-bg:         #f5f5f5;
@list-group-active-color:     #fff;
@list-group-active-bg:        @component-active-bg;
@list-group-active-border:    @list-group-active-bg;

@list-group-link-color:          #555;
@list-group-link-heading-color:  #333;


// Panels
// -------------------------
@panel-bg:                    #fff;
@panel-inner-border:          #ddd;
@panel-border-radius:         @border-radius-base;
@panel-footer-bg:             #f5f5f5;

@panel-default-text:          @gray-dark;
@panel-default-border:        #ddd;
@panel-default-heading-bg:    #f5f5f5;

@panel-primary-text:          #fff;
@panel-primary-border:        @brand-primary;
@panel-primary-heading-bg:    @brand-primary;

@panel-success-text:          @state-success-text;
@panel-success-border:        @state-success-border;
@panel-success-heading-bg:    @state-success-bg;

@panel-warning-text:          @state-warning-text;
@panel-warning-border:        @state-warning-border;
@panel-warning-heading-bg:    @state-warning-bg;

@panel-danger-text:           @state-danger-text;
@panel-danger-border:         @state-danger-border;
@panel-danger-heading-bg:     @state-danger-bg;

@panel-info-text:             @state-info-text;
@panel-info-border:           @state-info-border;
@panel-info-heading-bg:       @state-info-bg;


// Thumbnails
// -------------------------
@thumbnail-padding:           4px;
@thumbnail-bg:                @body-bg;
@thumbnail-border:            #ddd;
@thumbnail-border-radius:     @border-radius-base;

@thumbnail-caption-color:     @text-color;
@thumbnail-caption-padding:   9px;


// Wells
// -------------------------
@well-bg:                     #f5f5f5;


// Badges
// -------------------------
@badge-color:                 #fff;
@badge-link-hover-color:      #fff;
@badge-bg:                    @gray-light;

@badge-active-color:          @link-color;
@badge-active-bg:             #fff;

@badge-font-weight:           bold;
@badge-line-height:           1;
@badge-border-radius:         10px;


// Breadcrumbs
// -------------------------
@breadcrumb-bg:               #f5f5f5;
@breadcrumb-color:            #ccc;
@breadcrumb-active-color:     @gray-light;


// Carousel
// ------------------------

@carousel-text-shadow:                        0 1px 2px rgba(0,0,0,.6);

@carousel-control-color:                      #fff;
@carousel-control-width:                      15%;
@carousel-control-opacity:                    .5;
@carousel-control-font-size:                  20px;

@carousel-indicator-active-bg:                #fff;
@carousel-indicator-border-color:             #fff;

@carousel-caption-color:                      #fff;


// Close
// ------------------------
@close-color:                 #000;
@close-font-weight:           bold;
@close-text-shadow:           0 1px 0 #fff;


// Code
// ------------------------
@code-color:                  #c7254e;
@code-bg:                     #f9f2f4;

@pre-bg:                      #f5f5f5;
@pre-color:                   @gray-dark;
@pre-border-color:            #ccc;
@pre-scrollable-max-height:   340px;

// Type
// ------------------------
@text-muted:                  @gray-light;
@abbr-border-color:           @gray-light;
@headings-small-color:        @gray-light;
@blockquote-small-color:      @gray-light;
@blockquote-border-color:     @gray-lighter;
@page-header-border-color:    @gray-lighter;

// Miscellaneous
// -------------------------

// Hr border color
@hr-border:                   @gray-lighter;

// Horizontal forms & lists
@component-offset-horizontal: 180px;


// Container sizes
// --------------------------------------------------

// Small screen / tablet
@container-tablet:            ((720px + @grid-gutter-width));

// Medium screen / desktop
@container-desktop:           ((940px + @grid-gutter-width));

// Large screen / wide desktop
@container-lg-desktop:        ((1140px + @grid-gutter-width));

// --------------------------------------------------------
// BOOTSTRAP
// --------------------------------------------------------
@import "variables.less";
@import "bootstrap/less/mixins.less";
// We just need a few modules in our framework. Get them !
@import "overrides/bootstrap/modules.less";
// Do some stuff that override bootstrap
@import "overrides/bootstrap/index.less";


// --------------------------------------------------------
// OTHER VENDORS
// --------------------------------------------------------

@import (less) "angular-loading-bar/src/loading-bar.css";
@import "overrides/loading-bar.less";
@import "overrides/datepicker.less";
@import (inline) "jquery-ui/themes/base/jquery-ui.css";
@import (inline) "select2/select2.css";
@import "overrides/select2.less";
.transition-property(@transition-property) {
  -webkit-transition-property: @transition-property;
          transition-property: @transition-property;
}

@-webkit-keyframes spin-keyframes {
    0%  {
        -webkit-transform: rotateZ(0deg);
    }
    100% {
        -webkit-transform: rotateZ(360deg);
    }
}

@-moz-keyframes spin-keyframes {
    0%  {
        -moz-transform: rotateZ(0deg);
    }
    100% {
        -moz-transform: rotateZ(360deg);
    }
}

@keyframes spin-keyframes {
    0%  {
        transform: rotateZ(0deg);
    }
    100% {
        transform: rotateZ(360deg);
    }
}

.spin(@duration) {
      -webkit-animation: spin-keyframes @duration linear infinite;
         -moz-animation: spin-keyframes @duration linear infinite;
          -ms-animation: spin-keyframes @duration linear infinite;
           -o-animation: spin-keyframes @duration linear infinite;
              animation: spin-keyframes @duration linear infinite;

}

.container-loading {
    &:before {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: @gray-lighter;
        z-index: 2;
        content: ' ';
    }

    &:after {
        @size: 60px;
        &:extend(.icon-evaneos all);
        color: @gray-light;
        font-size: @size;
        top: 50%;
        left: 50%;
        margin-left: (@size * -0.5);
        margin-top: (@size * -0.5);
        position: absolute;
        z-index: 3;
        content: "\e616";
        .spin(2s);
    }
}
@check-radio-size: 18px;

.checkradiobox {
    @padding: 3px;
    margin: 0 4px 0 0; padding: 0;
    min-height: @check-radio-size;
    min-width: @check-radio-size;
    position: relative;
    display: inline-block;
    width: @check-radio-size;
    height: @check-radio-size;
    border: 1px solid @gray-light;
    background: #FFF;
    &:hover {
        border-color: @gray;
    }
    &:active {
        background: @gray-lighter;
        border-color: @gray;
    }
    &.active {
        &:after {
            position: absolute;
            top: 1px;
            left: 1px;
            &:extend(.icon-tick all);
            content: '\e62f';
        }
    }
}

.checkbox {
    &:extend(.checkradiobox all);
    border-radius: @border-radius-small;
    &.active:after {
        border-radius: 1px;
    }
}
.radiobox {
    &:extend(.checkradiobox all);
    border-radius: (@check-radio-size/2);
    &.active:after {
        border-radius: (@check-radio-size/2);
    }
}

.link-action {
    display: inline-block;
    margin-top: 6px;
    cursor: pointer;
    margin-left: 3px;

    &:hover span {
        text-decoration: none;
    }

    &[disabled] {
        color: @gray;
        cursor: default;

        &:hover {
            text-decoration: none;
        }
    }
}

/**
 * Hide the arrows on input type number
 */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type=number] {
    -moz-appearance: textfield;
}

input {
    border: 1px solid @gray-light;
    padding: 2px 6px;
    border-radius: @border-radius-base;
    outline: none;
}

.select2-container {
    width: 100%;
}
div.common-data {

    @gutter-size: 5px;

    > div {

        &.common-header {
            border-bottom: 1px solid @gray-lighter;

            > .common-label,
            > .common-value {
                color: @gray;
                font-size: 12px;
            }
        }

        > div {
            line-height: 1.4em;
            padding-top: @gutter-size;
            padding-bottom: @gutter-size;

            &.common-label {
                color: @gray;
                &:after {
                    content: ":";
                    margin-left: 3px;
                }
            }

            &.common-value {
                color: @gray-dark;
            }
        }
    }

    /**
     * or use BS3's table.table(.table-condensed)
     */
    &.common-table-mode {
        > div {
            border-bottom: 1px solid @gray-lighter;

            &.common-header {
                border-bottom: 1px solid @gray-lighter;
            }

            > div {

                &.common-label {
                    &:after {
                        display: none;
                    }
                }
            }
        }
    }
}
table {
    .iconizer {
        background-image: url(/stylesheets/lisette/pics/lisette_icons_16.png);
        width: 16px;
        height: 16px;
        background-repeat: no-repeat;
        background-position-x : 0px;
        display: inline-block;
    }

    .flagizer {
        background-image: url(/images/francine/flags_sprite.png);
        width: 16px;
        height: 11px;
        margin-top : 3px;
        background-repeat: no-repeat;
        display: inline-block;
    }

    td.td-icon, td {
        i.icon {
            .iconizer;
        }

        i.icon.icon-flag {
            .flagizer;
        }

        i.icon.icon-created         { background-position : 0px -288px; }
        i.icon.icon-assigned        { background-position : 0px -272px; }
        i.icon.icon-submitted       { background-position : 0px -256px; }
        i.icon.icon-refused         { background-position : 0px -208px; }
        i.icon.icon-validated       { background-position : 0px -224px; }
        i.icon.icon-online          { background-position : 0px -192px; }
        i.icon.icon-deleted         { background-position : 0px -208px; }

        i.icon.flag-fr              { background-position: -128px -44px; }
        i.icon.flag-en              { background-position: -160px -44px; }
        i.icon.flag-unknown         { background-position: 0 0; }
        i.icon.flag-es              { background-position: 0px -44px; }
        i.icon.flag-it              { background-position: -144px -66px; }
        i.icon.flag-de              { background-position: -64px -33px; }
    }

    tr:hover td.td-icon, td.td-icon:hover, tr:hover td, td:hover {
        i.icon.icon-flag {
            .flagizer;
        }

        i.icon.icon-created         { background-position : -16px -288px; }
        i.icon.icon-assigned        { background-position : -16px -272px; }
        i.icon.icon-submitted       { background-position : -16px -256px; }
        i.icon.icon-refused         { background-position : -16px -208px; }
        i.icon.icon-validated       { background-position : -16px -224px; }
        i.icon.icon-online          { background-position : -16px -192px; }
        i.icon.icon-deleted         { background-position : -16px -208px; }

        i.icon.flag-fr              { background-position: -128px -44px; }
        i.icon.flag-en              { background-position: -160px -44px; }
        i.icon.flag-unknown         { background-position: 0 0; }
        i.icon.flag-es              { background-position: 0px -44px; }
        i.icon.flag-it              { background-position: -144px -66px; }
        i.icon.flag-de              { background-position: -64px -33px; }
    }

    tr:active td.td-icon, td.td-icon:active, tr:active td, td:active {
        i.icon.icon-flag {
            .flagizer;
        }

        i.icon.icon-created         { background-position : -32px -288px; }
        i.icon.icon-assigned        { background-position : -32px -272px; }
        i.icon.icon-submitted       { background-position : -32px -256px; }
        i.icon.icon-refused         { background-position : -32px -208px; }
        i.icon.icon-validated       { background-position : -32px -224px; }
        i.icon.icon-online          { background-position : -32px -192px; }
        i.icon.icon-deleted         { background-position : -32px -208px; }

        i.icon.flag-fr              { background-position: -128px -44px; }
        i.icon.flag-es              { background-position: 0px -44px; }
        i.icon.flag-en              { background-position: -160px -44px; }
        i.icon.flag-unknown         { background-position: 0 0; }
        i.icon.flag-it              { background-position: -144px -66px; }
        i.icon.flag-de              { background-position: -64px -33px; }
    }

    tr.selected {
        i.icon.icon-flag {
            .flagizer;
        }

        i.icon.icon-created         { background-position : -48px -288px; }
        i.icon.icon-assigned        { background-position : -48px -272px; }
        i.icon.icon-submitted       { background-position : -48px -256px; }
        i.icon.icon-refused         { background-position : -48px -208px; }
        i.icon.icon-validated       { background-position : -48px -224px; }
        i.icon.icon-online          { background-position : -48px -192px; }
        i.icon.icon-deleted         { background-position : -48px -208px; }

        i.icon.flag-fr              { background-position: -128px -44px; }
        i.icon.flag-es              { background-position: 0px -44px; }
        i.icon.flag-en              { background-position: -160px -44px; }
        i.icon.flag-unknown         { background-position: 0 0; }
        i.icon.flag-it              { background-position: -144px -66px; }
        i.icon.flag-de              { background-position: -64px -33px; }
    }
}
@font-face {
    font-family: 'icomoon';
    src:url('@{path-fonts}/icomoon/sidonie.woff?2014-06-18-1630') format('woff'),
        url('@{path-fonts}/icomoon/sidonie.svg?2014-06-18-1630#icomoon') format('svg'),
        url('@{path-fonts}/icomoon/sidonie.eot?2014-06-18-1630#iefix') format('embedded-opentype'),
        url('@{path-fonts}/icomoon/sidonie.ttf?2014-06-18-1630') format('truetype');
    font-weight: normal;
    font-style: normal;
}

/**
 * Hack for Chrome on Windows
 */
@media screen and (-webkit-min-device-pixel-ratio:0) {
    @font-face {
        font-family: 'icomoon';
        src: url('@{path-fonts}/icomoon/sidonie.svg?2014-06-18-1630#icomoon') format('svg');
    }
}

/* Use the following CSS code if you want to have a class per icon */
/*
Instead of a list of all class selectors,
you can use the generic selector below, but it's slower:
[class*="icon-"] {
*/
.icon,
.icon-edit,
.icon-clock,
.icon-blocked,
.icon-warning,
.icon-read,
.icon-phone,
.icon-note,
.icon-mail,
.icon-tick,
.icon-help,
.icon-calendar,
.icon-bin,
.icon-infos,
.icon-attached,
.icon-discussions,
.icon-workflow,
.icon-users,
.icon-triangle-right,
.icon-triangle-left,
.icon-triangle_up,
.icon-triangle_down,
.icon-traveller-source,
.icon-testimonial,
.icon-tableur,
.icon-stats,
.icon-source,
.icon-settings,
.icon-search,
.icon-reduction,
.icon-prefilled,
.icon-pixels,
.icon-pdf,
.icon-other,
.icon-money,
.icon-lambda,
.icon-home,
.icon-filter,
.icon-faq,
.icon-evaneos,
.icon-emo-sad,
.icon-emo-normal,
.icon-emo-happy,
.icon-download,
.icon-dossiers-voyageurs,
.icon-doc,
.icon-doc-lambda,
.icon-display-lines,
.icon-display-hierarchical,
.icon-cross,
.icon-create,
.icon-article,
.icon-arrow-up,
.icon-arrow-right,
.icon-arrow-left,
.icon-arrow-down,
.icon-agences-locales {
    font-family: 'icomoon';
    font-style: normal;
    font-weight: normal;
    speak: none;

    display: inline-block;
    text-decoration: inherit;
    width: 1em;
    margin-right: .2em;
    text-align: center;
    /* opacity: .8; */

    /* For safety - reset parent styles, that can break glyph codes*/
    font-variant: normal;
    text-transform: none;

    /* fix buttons height, for twitter bootstrap */
    line-height: 1em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.icon-edit:before {
    content: "\e637";
}
.icon-clock:before {
    content: "\e635";
}
.icon-blocked:before {
     content: "\e636";
}
.icon-warning:before {
     content: "\e630";
}
.icon-read:before {
     content: "\e631";
}
.icon-phone:before {
     content: "\e632";
}
.icon-note:before {
     content: "\e633";
}
.icon-mail:before {
    content: "\e634";
}
.icon-tick:before {
    content: "\e62f";
}
.icon-help:before {
    content: "\e600";
}
.icon-calendar:before {
    content: "\e601";
}
.icon-bin:before {
    content: "\e602";
}
.icon-infos:before {
    content: "\e62b";
}
.icon-attached:before {
    content: "\e62a";
}
.icon-discussions:before {
    content: "\e629";
}
.icon-workflow:before {
    content: "\e603";
}
.icon-users:before {
    content: "\e604";
}
.icon-triangle-right:before {
    content: "\e605";
}
.icon-triangle-left:before {
    content: "\e606";
}
.icon-triangle_up:before {
    content: "\e607";
}
.select2-container .select2-choice .select2-arrow b:before,
.icon-triangle_down:before {
    content: "\e608";
}
.icon-traveller-source:before {
    content: "\e609";
}
.icon-testimonial:before {
    content: "\e60a";
}
.icon-tableur:before {
    content: "\e60b";
    color:@brand-green;
}
.icon-stats:before {
    content: "\e60c";
}
.icon-source:before {
    content: "\e627";
}
.icon-settings:before {
    content: "\e626";
}
.icon-search:before {
    content: "\e624";
}
.icon-reduction:before {
    content: "\e625";
}
.icon-prefilled:before {
    content: "\e60d";
}
.icon-pixels:before {
    content: "\e60e";
}
.icon-pdf:before {
    content: "\e60f";
    color: @brand-red;
}
.icon-other:before {
    content: "\e610";
}
.icon-money:before {
    content: "\e611";
}
.icon-lambda:before {
    content: "\e612";
}
.icon-home:before {
    content: "\e613";
}
.icon-filter:before {
    content: "\e614";
}
.icon-faq:before {
    content: "\e615";
}
.icon-evaneos:before {
    content: "\e616";
}
.icon-emo-sad:before {
    content: "\e617";
}
.icon-emo-normal:before {
    content: "\e618";
}
.icon-emo-happy:before {
    content: "\e619";
}
.icon-download:before {
    content: "\e61a";
}
.icon-dossiers-voyageurs:before {
    content: "\e61b";
}
.icon-doc:before {
    content: "\e61c";
    color:@brand-info;
}
.icon-doc-lambda:before {
    content: "\e61d";
    color: @brand-warning;
}
.icon-display-lines:before {
    content: "\e61e";
}
.icon-display-hierarchical:before {
    content: "\e61f";
}
.icon-cross:before {
    content: "\e620";
}
.icon-create:before {
    content: "\e621";
}
.icon-article:before {
    content: "\e622";
}
.icon-arrow-up:before,
.trend.up i:before {
    content: "\e623";
}
.icon-arrow-right:before {
    content: "\e628";
}
.icon-arrow-left:before {
    content: "\e62c";
}
.icon-arrow-down:before,
.trend.down i:before {
    content: "\e62d";
}
.icon-agences-locales:before {
    content: "\e62e";
}
/******************************************************
 * Put here all the styles likely to be reused
 * throughout Lisette
 * - make separate common/*.less files for components
 *   getting too big
 ******************************************************/

.common-block {
    display: block;
}

.common-truncate {
    .text-overflow();
}

.common-empty-indic {
    padding: 40px;
    color: @gray;
    font-size: 14px;
    text-align: center;
}

// case switching scenarios
.case-create,
.case-edit {
    display: none;
}
.incase-create .case-create,
.incase-edit .case-edit {
    display: block;
}
.incase-create .case-create-i,
.incase-edit .case-edit-i {
    display: inline-block;
}

// big fat splashscreen used in modules
// to indicate that an operation is in progress
.progress-splashscreen {
    &:extend(.container-loading all);
    &:before {
        background: #FFF !important;
    }
}

// values that are undefined
.common-value {
    &.common-empty {
        font-style: italic;
        color: @gray;
    }
}

@import "icons.less";
@import "trends.less";
@import "table.less";
@import "flags.less";
@import "data.less";
@import "loading-dots.less";
@import "sortable.less";
@import "animations.less";
@import "controls.less";
@import "panels.less";
@import "list.less";
@import "promise.less";
@import "tiny-mce.less";
@import "utils.less";
/**
 *  A list containing elements
 *
 *  Template example:
 *
    <div class="list-container">
        <div ng-repeat="message in messagesArray"
            activable-set
            activable="message"
            active-element="context.activeMessage"
            class="list-element"
            ng-class="{'list-element-new':message.isNew}">

            <div class="infos">
                <div class="state state-{{message.state | stateNameFromId}}">&nbsp;</div>
            </div>
            <div class="element-content">
                <div class="header">
                    <div class="main-information">
                        {{ message.user.fullName }}
                    </div>
                    <div class="extra-information">
                        <span am-time-ago="message.sendDate"></span>
                    </div>
                </div>
                <div class="title">{{ message.subject }}</div>
                <div class="description">{{ message.shortBody }}</div>
            </div>
        </div>
    </div>
 */
.list-container {
    height: 100%;
    overflow-y: auto;

    /**
     * The element
     */
    .list-element {
        padding: 5px;
        border-bottom: 1px solid @gray-lighter;
        border-left: @layout-gutter solid transparent;
        cursor: pointer;
        position: relative;
        height: 71px;

        /**
         * The left section containing informations
         */
        .infos {
            width: 20px;
            height: 100%;
            float: left;
            text-align: center;
            padding-top: 2px;

            > div {
                margin-top: 3px;

                &:first-child {
                    margin-top: 0;
                }
            }

            .icon {
                color: @gray;
            }
        }

        /**
         * Element content
         */
        .element-content {
            /**
             * The header with main informations
             */
            .header {
                .main-information {
                    margin-right: 80px;
                    .text-overflow();

                    .icon {
                        color: @gray;
                    }
                }

                .extra-information {
                    color: @gray;
                    position: absolute;
                    right: 8px;
                    top: 5px;

                    .icon-warning, .icon-blocked {
                        color: @brand-warning;
                    }
                }

            }

            /**
             * Second line on this element
             */
            .title {
                color: @gray;
                display: block;
                .text-overflow();
            }

            /**
             * Third line
             */
            .description {
                color: @gray;
                display:block;
                .text-overflow();
            }
        }

        /**
         * An active element get a colorful border left
         */
        &.active {
            border-left: @layout-gutter solid @brand-primary;
            background: @gray-lighter;
        }

        /**
         * An element with a new class, is more visible
         */
        &-new {
            .main-information {
                color: @gray-darker;
                font-weight: bold;
            }

            .extra-information {
                color: @gray-dark;
            }
        }
    }
}

// Responsive lines in a panel
.panel {
    &[data-breakpoint='min'],
    &[data-breakpoint='100'],
    &[data-breakpoint='200'],
    &[data-breakpoint='300'] {
        .list-container .list-element {
            height: auto;
            .title, .description {
                display: none;
            }
        }
    }
}
.loading-dots {
    font-size: 1em; /* set size here */

    line-height: 1;
    width: 2.75em;

    > span {
        background: @gray;
        border-radius: 50%;
        // box-shadow: inset 0 0 1px rgba(0,0,0,0.3);
        display: inline-block;
        height: 0.2em;
        width: 0.2em;
        margin: 0.1em;
        -webkit-animation: loading-dots-anim 0.8s linear infinite;
        -moz-animation: loading-dots-anim 0.8s linear infinite;
        -ms-animation: loading-dots-anim 0.8s linear infinite;
        animation: loading-dots-anim 0.8s linear infinite;
    }
    > span:nth-child(2) {
        margin-left: 0.1em;
        -webkit-animation-delay: 0.2s;
        -moz-animation-delay: 0.2s;
        -ms-animation-delay: 0.2s;
        animation-delay: 0.2s;
    }
    > span:nth-child(1) {
        margin-left: 0em;
        -webkit-animation-delay: 0.4s;
        -moz-animation-delay: 0.4s;
        -ms-animation-delay: 0.4s;
        animation-delay: 0.4s;
    }
}


@-webkit-keyframes loading-dots-anim {
    0% {
        background: transparent;
    }
    50% {
        background: @gray;
    }
    100% {
        background: transparent;
    }
}

@-moz-keyframes loading-dots-anim {
    0% {
        background: transparent;
    }
    50% {
        background: @gray;
    }
    100% {
        background: transparent;
    }
}
@-ms-keyframes loading-dots-anim {
    0% {
        background: transparent;
    }
    50% {
        background: @gray;
    }
    100% {
        background: transparent;
    }
}
@keyframes loading-dots-anim {
    0% {
        background: transparent;
    }
    50% {
        background: @gray;
    }
    100% {
        background: transparent;
    }
}
.panel-placeholder {
    height: 100%;
    float: left;
    position: relative;

    &:first-child {
        box-shadow: 0 5px 10px rgba(0,0,0,.3);
    }

    > .panel {
        background: #FFF;
        height: 100%;
        width: 450px;
        border-left: 1px solid @gray-light;
        position: relative;
        left: auto!important;
        z-index: @zindex-modal;
        background: #FFF;

        > .inner {
            height: 100%;
            border-left: 7px solid @gray-lighter;
            border-right: 7px solid @gray-lighter;
            overflow-x: hidden;
            overflow-y: hidden;

            /*********************************************************
             * HEADER
             ********************************************************/

            > .header {
                background: @gray-lighter;
                padding: 9px 16px;
                z-index: 2;
                .title {
                    font-size: 20px;
                    text-transform: uppercase;
                    line-height: 1.7em;
                    margin-right: 30px;
                    display: block;
                    .text-overflow();
                }
                .close {
                    font-size: 32px;
                    color: @gray;
                    opacity: 1;
                    width: 50px;
                    height: 50px;
                    box-shadow: none;
                    text-shadow: none;
                    outline: none;
                    position: absolute;
                    top: 1px;
                    right: 0px;

                    &:hover {
                        color: @gray-dark;
                    }
                }
            }

            /*********************************************************
             * BODY
             ********************************************************/

            > .body {
                padding: 15px;
                &.nopadding {
                    padding: 0;
                }
                h4 {
                    margin-top: 20px;
                    color: @gray;
                    text-transform: uppercase;
                    font-size: 14px;
                    margin-bottom: 10px;
                    &:first-child {
                        margin-top: 0px;
                    }
                }
            }

            /*********************************************************
             * FOOTER
             ********************************************************/


            > .footer {
                padding: 9px 16px;
                background: @gray-lighter;
                text-align: right;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 2;
                .btn {
                    margin-left: 10px;
                    min-width: 150px;
                    &:first-child {
                        margin-left: 0;
                    }
                }
            }
        }


        /*********************************************************
         * RESIZABLE HANDLER
         ********************************************************/

        > .ui-resizable-handle {
            left: 0;
        }
        &.ui-resizable-resizing {
            > .ui-resizable-handle {
                width: 100%;
                background: transparent;
                border-left: 7px solid @gray-light;
            }
        }
    }

    /*********************************************************
     * STACKED STATE
     ********************************************************/

    &.stacked {
        // important to override size set by jq ui
        max-width: 15px;
        > .panel > .inner > .header .title,
        > .panel > .inner > .body,
        > .panel > .inner > .footer {
            display: none;
        }
    }


    &.stacked-add.stacked-add-active,
    &.stacked-remove {
        max-width: 30px;
    }

    &.stacked-add,
    &.stacked-remove.stacked-remove-active {
        max-width: 1000px;
    }
}

/*********************************************************
 * ANIMATIONS
 ********************************************************/

.lisette-module-region.right.animate .panel-placeholder {
    @animation-duration: 0.2s;
    .obfuscate() {
        // animation : slow at the beginning, fast at the end
        // => after will be hidden at the really end of the animation
        -webkit-transition: opacity cubic-bezier(1, 0, 1, 0) @animation-duration;
        transition: opacity cubic-bezier(1, 0, 1, 0) @animation-duration;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: @gray-lighter;
        z-index: 200000000;
        content: ' ';
    }

    &.stacked-add {
        -webkit-transition:all ease-in-out @animation-duration;
        -moz-transition:all ease-in-out @animation-duration;
        -o-transition:all ease-in-out @animation-duration;
        transition:all ease-in-out @animation-duration;
    }
    &.stacked-remove {
        -webkit-transition:all ease-in-out @animation-duration;
        -moz-transition:all ease-in-out @animation-duration;
        -o-transition:all ease-in-out @animation-duration;
        transition:all ease-in-out @animation-duration;
    }

    &.ng-enter,
    &.ng-leave {
        -webkit-transition: all ease-in-out @animation-duration;
        transition: all ease-in-out @animation-duration;
        &:after {
            .obfuscate();
        }
    }

    &.ng-enter,
    &.ng-leave.ng-leave-active {
        max-width: 0;
        &:after {
            opacity: 1;
        }
    }

    &.ng-leave,
    &.ng-enter.ng-enter-active {
        max-width: 1000px;
        &.ng-enter.ng-enter-active {
            &:after {
                opacity: 0;
            }
        }
    }
}
.promise-default-styles {

    &.promise-resolving {
        &:extend(.progress-splashscreen all);
    }

    .promise-empty-message {
        display: none;
        width: 200px;
        text-align: center;
        position: absolute;
        left: 50%;
        top: 50%;
        margin-top: -10px;
        margin-left: -100px;
        font-size: @font-size-large;
        color: @gray;
        z-index: 3;
    }

    &.promise-resolved.promise-empty {
        &:extend(.progress-splashscreen all);
        &:after {
            display: none;
        }
        .promise-empty-message {
            display: inline-block;
        }
    }

    &.promise-rejected {
        &:extend(.progress-splashscreen all);
        &:after {
            &:extend(.icon-emo-sad all);
            content: "\e617";
            color: @brand-danger;
            opacity: .5;
          -webkit-animation: none;
             -moz-animation: none;
              -ms-animation: none;
               -o-animation: none;
                  animation: none;
        }
    }

}
// sortable column headers
.sortable {
    cursor: pointer;
    white-space: nowrap;

    // display the arrow of the sort predicted
    &:after {
        visibilty: display;
        border-top: @caret-width-base solid @gray;
        border-bottom: 0 dotted;
    }

    &:hover {
        color: @gray-dark;
        // display the arrow of the sort predicted
        &:after {
            visibilty: display;
            border-top: @caret-width-base solid @gray-dark;
            border-bottom: 0 dotted;
        }
    }

    &:after {
        visibilty: hidden;
        display: inline-block;;
        width: 0;
        height: 0;
        margin-left: 2px;
        vertical-align: middle;
        border-right: @caret-width-base solid transparent;
        border-left:  @caret-width-base solid transparent;
        content: "";
        position: relative;
        top: -1px;
    }
    &.sort-down,
    &.sort-up {
        padding-right: 15px;
        color: @brand-primary;
        font-weight: bold;
        &:hover:after {
            border-top-color: @brand-primary;
        }
    }

    &.sort-down {
        &:after {
            display: inline-block;
            border-bottom: @caret-width-base solid @brand-primary;
            border-top: 0 dotted;
        }
    }

    &.sort-up {
        &:after {
            display: inline-block;
            border-top: @caret-width-base solid @brand-primary;
            border-bottom: 0 dotted;
        }
    }
}
.table-empty-indicator {
    color: @gray;
    font-size: 14px;
    text-align: center;

    > div {
        border-bottom: 1px solid @gray-light;
        background: #FFF;
        min-height: 40px;

        &.message {
            padding: 0;
            line-height: 3em;
        }
    }
}

table.table {
    thead > tr > th {
        font-size: 13px;
        padding-left: 0;
    }
    tr {
        &:last-child {
            &.no-bottom-border-if-last {
                td, th {
                    border-bottom: none;
                    padding-bottom: 0;
                }
            }
        }
    }

    td, th {
        &:last-child {
            &.text-right, &.amounts {
                padding-right: 10px;
            }
        }
    }

    td.icon-cell {
        width: 14px;

        .icon-bin,
        .glyphicon-trash {
            color: @gray;
            cursor: pointer;

            &:hover {
                color: @gray-dark;
            }
        }
        .icon-bin {
            line-height: 34px;
        }
    }

    .block-active {
        .user-select(none);
    }

    &.noselect{
        .user-select(none);
    }
}

.clickable {
    cursor:pointer;
}

/**
 *  Skin light
 */

*[class*='mce-'] { -webkit-border-radius: 0!important; -moz-border-radius: 0!important; border-radius: 0!important; }
.mce-throbber { background: #fff; }
.mce-tinymce button, .mce-panel button { -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }
.mce-panel { background: #fff; filter: none; border: 0 solid #fff; }
.mce-in .mce-panel { background: #f3f3f3; border-top: 1px solid #ddd; }
.mce-edit-area { border: 1px solid #ddd!important; }
.mce-btn-group .mce-first, .mce-btn-group .mce-last { border: 0!important; }
.mce-toolbar .mce-btn button { padding-top: 3px; padding-bottom: 3px; }
.mce-toolbar .mce-btn i { color: #555; }
.mce-toolbar .mce-btn:hover i { color: #333; }
.mce-toolbar .mce-btn, .mce-toolbar .mce-btn.mce-disabled { background: none!important; filter: none!important; border: 0; -webkit-box-shadow: none!important; -moz-box-shadow: none!important; box-shadow: none!important; }
.mce-toolbar .mce-btn.mce-disabled { opacity: .4!important; filter: alpha(opacity=40)!important; }
.mce-toolbar .mce-btn.mce-active { background: #eee!important; }
.mce-floatpanel { -webkit-box-shadow: 0 3px 7px rgba(0,0,0,.3); -moz-box-shadow: 0 3px 7px rgba(0,0,0,.3); box-shadow: 0 3px 7px rgba(0,0,0,.3); }
.mce-btn { background: #f0f0f0; }
.mce-btn:hover { background: #e9e9e9; }
.mce-primary { background: #7fba00; }
.mce-primary:hover, .mce-primary:focus { background: #88ca00; }
.mce-primary:active { background: #555; }
.mce-textbox { -webkit-transition: none; transition: none; }
.mce-textbox:focus { border-color: #38add7; -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }
.mce-menu-item:hover, .mce-menu-item.mce-selected, .mce-menu-item:focus { background: #eee; }
.mce-menu-item:hover .mce-text, .mce-menu-item.mce-selected .mce-text { color: #333; }

/**
 * Custom
 */
.mce-tinymce {
  height: 100% !important;

  .mce-container-body.mce-stack-layout {
    position: relative;
    height: 100%;

    .mce-container.mce-panel.mce-first.mce-stack-layout-item {
      position: absolute;
      top: 100%;
      width: 100%;
      background: @gray-lighter !important;
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .mce-edit-area {
      height: 100%;
    }
  }
}

.mce-panel {
  background: white !important;
  border: none !important;
}

.mce-widget.mce-tooltip {
    display: none !important;
}
.trend {
    i {
        margin-right: 10px;
        margin-left: -10px;
    }
    // icons are injected in icons.less

    &.reverse {
        &.up {
            color: @brand-warning;
        }
        &.down {
            color: @brand-success;
        }
    }
    &.up {
        color: @brand-success;
    }
    &.down {
        color: @brand-warning;
    }

    &.equal {
        color: @gray-dark;
        i {
            margin-right: 0px;
            &:before {
                // content: '=';
                // font-family: Arial;
                // font-weight: bold;
            }
        }
    }
    .loading-dots {
        display: none;
    }
    &.promise-resolving {
        .loading-dots {
            display: inline-block;
        }
        > .inner {
            display: none;
        }
    }
}
/**
 * Utils file contains useful mixins
 */

/**
 * Allows you to draw a sticker (a colorful circle).
 * This sticker can contains a stick inside.
 * Usage:
 *      .sticker-mixin(17px, @brand-warning, @brand-info);
 *
 * OR
 *
 *      .state {
 *          .sticker-mixin;
 *           &-large {
 *              .sticker-mixin(17px);
 *           }
 *
 *          &-engaged {
 *              background-color: @brand-red;
 *          }
 *
 *          &-sold {
 *              background-color: @brand-warning;
 *           }
 *       }
 *
 * In your template:
 *
 *    <div class="state state-{{quote.state}} state-large">
 *       <span class="icon icon-tick"></span>
 *    </div>
 */
.sticker-mixin(@size: 14px, @color: @gray-light, @tick-color: white) {
    width: @size;
    height: @size;
    border-radius: @size/2;
    background: @color;

    .icon-tick {
        color: @tick-color;
        font-size: @size - @size/3;
        display: block;
        line-height: @size;
        margin: 0 auto;
        margin-left: @size/5;
        padding-top: 1px;
    }
}

.sticker {
    .sticker-mixin();
}
html,
body {
    width: 100%;
    height: 100%;
    background: #FFF;
}

body {
    // hack to make chrome display nice effects
    // + fixes color changes when transitions happen
    //-webkit-transform: translateZ(0);
    -webkit-backface-visibility: hidden;

    .lisette-body {
        position: fixed;
        top: @menu-height;
        left: 0;
        right: 0;
        bottom: 0;
    }
}

@import "menu.less";
@import "module.less";

/**
 * SMALL VERSION OF MENU
 */

#lisette-menu {
    #small-menu {
        display: none;
    }
}

@media (max-width: @screen-desktop) {

    #lisette-menu {

        #lisette-menu-items {
            display: none;
        }

        #profile-menu {
            display: none;
        }

        #small-menu {
            position: absolute;
            right: 0; top: 0;
            display: block;
            margin: 0;

            .dropdown {
                width: auto;
                padding: 0 20px;

                .dropdown-toggle {
                    padding: 0;
                    .icon-display-inline {
                        display: inline-block;
                        float: left;
                        width: auto;
                        height: @menu-height;
                        line-height: @menu-height;
                        margin: 0;
                        font-size: 17px;
                    }
                    span {
                        display: inline-block;
                        margin-left: 5px;
                        line-height: @menu-height;
                    }
                }
                &.open {
                    background: #FFF;
                    .dropdown-toggle {
                        color: @brand-evaneos;
                    }
                }

                .dropdown-menu {
                    position: fixed;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                    background: #FFF;
                    top: @menu-height;
                    .menu-item {
                        a {
                            border-bottom: 1px solid @gray-light;
                            color: @gray-dark;
                            .title {
                                padding: 5px 10px;
                                font-size: 18px;
                            }
                            .icon {
                                font-size: 20px;
                                margin-top: 7px;
                                margin-left: 3px;
                            }
                        }
                        &.active a {
                            color: @brand-evaneos !important;
                        }
                        &:hover a {
                            color: @gray-darker !important;
                        }
                    }
                    .divider {
                        margin: 0;
                        height: 3px;
                        background-color: @brand-evaneos;
                    }
                }
            }
        }
    }
}
/**
 * TOP RED MENU WITH ALL MODULES, and PROFILE
 */

#lisette-menu {
    color: #FFF;
    border-radius: 0;
    min-height: 0;
    height: @menu-height;
    border: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: (@zindex-modal-background - 2);

    .menu-item {
        width: auto;
        > a {
            padding: 5px 8px 4px 8px;
            .icon {
                display: none;
            }
            .title {
                top: 0px;
            }
        }
        &.active {
            .caret {
                display: block;
            }
        }
    }
    .navbar-header {
        padding: 4px;
        .navbar-brand {
            line-height: 1.2em;
            height: 20px;
            width: 190px;
        }
    }

    .menu-item {
        text-align: center;
        display: inline-block;
        position: relative;
        width: 115px;
        padding: 0 8px;

        &:hover {
            background: lighten(@brand-evaneos, 3%);
        }

        > a {
            padding: 5px 0 4px 0;
            > .caret {
                display: none;
                position: absolute;
                left: 50%;
                top: -1px;
                margin-left: -7px;
                border-top: 5px solid #FFF;
                border-right: 7px solid transparent;
                border-left: 7px solid transparent;
            }
        }

        .icon {
            display: block;
            height: 36px;
            width: 36px;
            font-size: 34px;
            margin: 0 auto 3px auto;
        }

        .title {
            display: block;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            .text-overflow();
            position: relative;
            top: -5px;
        }

        /**
         * Active module state
         */
        &.active {
            .icon {
                border-color: #FFF;
            }
        }
    }

    #lisette-menu-items {
        float: none;
        position: absolute;
        left: 200px;
        right: 300px;
        font-size: 0; // collapse white spaces
        display: block;
        text-align: center;

        li {
            display: inline-block;
            float: none;
        }
    }

    #profile-menu > .menu-item {
        width: auto;
    }

    #profile-menu { 
        .menu-help {
            background: @brand-danger;
            font-family: @font-family-sans-serif;

            &:hover {
                background: lighten(@brand-danger, 5%);
            }

            a {
                color: @navbar-inverse-link-active-color !important;

                .icon {
                    height: inherit;
                    width: inherit;
                    font-size: inherit;
                    display: inline-block;
                    margin-top: 3px;
                    margin-right: 5px;
                    float: left;
                }
            }
        }
    }

    /**
     * Dropdowns
     */

    // other apps
    // + profile menu
    .dropdown {
        &.open {
            background: lighten(@brand-evaneos, 3%);
        }
        .caret {
            margin-left: 5px;
        }
        .dropdown-menu {
            left: -1px;
            padding: 0;
            overflow: hidden;
            border-top: none;
            > li {
                width: 100%;
                color: @gray-dark;
                padding: 0;
                a {
                    padding: 10px 10px;
                    font-size: 12px;
                    font-weight: bold;
                    .title {
                        text-align: left;
                        top: 0;
                        &.text-center {
                            text-align: center;
                        }
                    }
                }
                .icon {
                    display: block;
                    font-size: 20px;
                    margin-left: -7px;
                    margin-right: 3px;
                    float: left;
                    margin-bottom: -10px;
                    margin-top: -2px;
                }
                &:hover a {
                    background: @gray-lighter;
                    color: @gray-darker;
                }
            }
        }
    }
}

/**
 * SMALL VERSION
 */

@import "menu-small.less";
/**
 * Lisette Module Main Area
 *
 * A module can contain multiple elements :
 * - a leftbar
 * - a topbar
 * - tabs
 *
 * All content must reside in the lisette-module-body area.
 */

@module-min-width: @screen-tablet;

// bar variables
@module-bar-stacked: @layout-gutter;
@module-tabs-height: (28px + @layout-gutter);
@module-topbar-height: 50px;
@module-topbar-height-size-big: 100px;
@module-topbar-height-size-mini: 8px;
@module-leftbar-width: 260px;
@module-bottombar-height: 32px;

.module-panel-animations() {
    // removing animations for the time being, not necessary
    // .transition(all @animation-duration ease-in-out);
    // .transition-property(~"width, left, right");
}

.lisette-module {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .lisette-module-body {
        .module-panel-animations();
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow-y: auto;
        overflow-x: hidden;
        &:before {
            display: block;
            height: 3000px;
        }
    }

    &.has-tabs {
        .lisette-module-body {
            top: @module-tabs-height;
        }
        .lisette-module-leftbar {
            top: @module-tabs-height;
        }
        .lisette-module-topbar {
            top: @module-tabs-height;
        }
    }

    &.has-topbar {
        .lisette-module-body {
            top: @module-topbar-height;
        }
        &.topbar-size-big .lisette-module-body {
            top: @module-topbar-height-size-big;
        }
        &.topbar-size-mini .lisette-module-body {
            top: @module-topbar-height-size-mini;
        }
    }

    &.has-bottombar {
        .lisette-module-body {
            bottom: @module-bottombar-height;
        }
    }

    &.has-leftbar {
        .lisette-module-body {
            left: @module-leftbar-width;
        }
        .lisette-module-topbar {
            left: @module-leftbar-width;
        }
        .lisette-module-bottombar {
            left: @module-leftbar-width;
        }
    }

    &.has-topbar.has-tabs {
        .lisette-module-body {
            top: (@module-tabs-height + @module-topbar-height);
        }
        &.topbar-size-big .lisette-module-body {
            top: (@module-tabs-height + @module-topbar-height-size-big);
        }
        &.topbar-size-mini .lisette-module-body {
            top: (@module-tabs-height + @module-topbar-height-size-mini);
        }
        .lisette-module-topbar {
            top: @module-tabs-height;
        }
    }

    @media (max-width: @screen-sm) {
        .lisette-module-leftbar {
            width: @module-bar-stacked;
        }
        .lisette-module-topbar,
        &.has-leftbar .lisette-module-topbar,
        .lisette-module-bottombar,
        &.has-leftbar .lisette-module-bottombar,
        .lisette-module-body,
        &.has-leftbar .lisette-module-body {
            left: @module-bar-stacked;
        }
    }
}

.lisette-module-region.right {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: @zindex-modal-background;
}

body.state-resolving {
    .lisette-module {
        &:extend(.container-loading all);
        &.has-tabs:before {
            top: @module-tabs-height;
        }
    }
}

body.module-bootstrapping {
    .lisette-body {
        &:extend(.container-loading all);
    }
}

// ------------------------------------
// BARS TOGGLABLE IN THE MODULE LAYOUT
// ------------------------------------

@import "module-bars/leftbar.less";
@import "module-bars/topbar.less";
@import "module-bars/bottombar.less";
@import "module-bars/tabs.less";

// ------------------------------------
// ELEMENTS OF MODULE THAT CAN BE ADDED
// ------------------------------------

@import "module-elements/actionbar.less";
@import "module-elements/notifications.less";
@import "module-elements/searchbar.less";
@import "module-elements/pagination.less";


.hasDatepicker {
    border: 1px solid @gray-light;
    border-radius: @border-radius-base;
    padding: 2px 5px;
}

#ui-datepicker-div {
    background: #FFF;
    .ui-widget-header {
        border-color: @gray-light;
        background: @gray-light;
        color: @gray-darker;
        font-weight: normal;
    }
    th span {
        color: @gray-darker;
        font-weight: normal;
    }
    tr td a {
        text-align: center;
    }
    .ui-state-default,
    .ui-widget-content .ui-state-default,
    .ui-widget-header .ui-state-default {
        background: #FFF;
    }
    .ui-widget-header {
        background: @gray-lighter;
    }
    .ui-state-highlight {
        border-color: @brand-evaneos;
    }
}
/**
 * These override styles definded in vendor/angular-loading-bar/src/..css
 */

@loading-bar-color: darken(@navbar-inverse-bg, 15%); //@brand-primary;

#loading-bar {

     .bar {
        background: @loading-bar-color;
        position: absolute;
        top: auto;
        bottom: -3px;
        height: 3px;
    }

    /**
     * Hide that crap for the moment
     */
    .peg {
        display: none;
    }

    #loading-bar-spinner .spinner-icon {
        border-top-color:  @loading-bar-color;
        border-left-color: @loading-bar-color;
    }
}
@select2-border-color: @gray-light;
@select2-color-active: @gray-lighter;
@select2-border-active-color: @gray-light;
@select2-border-color-light: @gray-lighter;

.select2-container .select2-choice {
    border: 1px solid @select2-border-color;
    color: @gray-darker;
    border-radius: @border-radius-base;
    background-image: none;
    background: #fff;
    filter: none;
    height: 34px;
    padding: 4px 0 4px 8px;

    &:focus {
        outline: none;
    }
}

.select2-control {
    width: 100%;
}

.select2-container.select2-drop-above .select2-choice {
    border-bottom-color: @select2-border-color;
    border-radius: 0 0 @border-radius-base @border-radius-base;
    background-image: none;
    filter: none;
}

.select2-container {
    .select2-choice abbr.select2-search-choice-close {
        height: 32px;
        width: 25px;
        top: 0;
        right: 25px;
        background: #FFF;
        border-left: 1px solid @select2-border-color-light;
        &:after {
            color: @gray;
            content: '×';
            font-size: 20px;
            line-height: 32px;
            text-align: center;
            width: 25px;
            display: inline-block;
        }
    }
    &.select2-dropdown-open .select2-choice abbr.select2-search-choice-close {
        display: none;
    }
}

.select2-drop-mask {
    background-color: #FFF;
}

.select2-drop {
    border: 1px solid @select2-border-color;
    border-top: none;
    border-radius: 0 0 @border-radius-base @border-radius-base;
    color: @gray-darker;
    // -webkit-box-shadow: 0 4px 5px rgba(0, 0, 0, .15);
    //         box-shadow: 0 4px 5px rgba(0, 0, 0, .15);
}

.select2-drop-auto-width {
    border-top: 1px solid @select2-border-color;
}

.select2-drop.select2-drop-above {
    border-top: 1px solid @select2-border-color;
    border-radius: @border-radius-base @border-radius-base 0 0;
}

.select2-drop-active {
    border-color: @select2-border-active-color;
}

.select2-drop.select2-drop-above.select2-drop-active {
    border-top: 1px solid @select2-border-active-color;
}

.select2-container .select2-choice .select2-arrow {
    border-left: 1px solid @select2-border-color-light;
    border-radius: 0 @border-radius-base @border-radius-base 0;
    background-image: none;
    background: #FFF;
    filter: none;
    width: 25px;
}

.select2-container .select2-choice .select2-arrow b {
    display: block;
    width: 100%;
    line-height: 3.6em;
    font-family: 'icomoon';
    font-size: 9px;
    color: @gray;
    text-align: center;
    background: transparent;
}

.select2-search input {
    border-color: @select2-border-color;
    background: #fff;
}

.select2-search input.select2-active {
    background: #fff;
}

.select2-container-active .select2-choice,
.select2-container-active .select2-choices {
    border: 1px solid @select2-border-active-color;
    box-shadow: none;
}

.select2-dropdown-open .select2-choice {
    -webkit-box-shadow: 0 1px 0 #fff inset;
            box-shadow: 0 1px 0 #fff inset;
    background: #FFF;
    filter: none;
    border-radius: @border-radius-base @border-radius-base 0 0;
}

.select2-dropdown-open.select2-drop-above .select2-choice,
.select2-dropdown-open.select2-drop-above .select2-choices {
    border: 1px solid @select2-border-active-color;
    border-bottom: none;
    background-image: #FFF;
    filter: none;
}

.select2-dropdown-open .select2-choice .select2-arrow {
    background: transparent;
    border-left: none;
    filter: none;
}

.select2-results .select2-highlighted {
    background: @select2-color-active;
    color: @gray-darker;
}

.select2-results li em {
    background: @gray-light;
}

.select2-results .select2-highlighted ul {
    color: @gray-darker;
}


.select2-results .select2-no-results,
.select2-results .select2-searching,
.select2-results .select2-selection-limit {
    background: @gray-lighter;
}

/*
disabled look for disabled choices in the results dropdown
*/
.select2-results .select2-disabled.select2-highlighted {
    color: @gray-light;
    background: @gray-lighter;
}
.select2-results .select2-disabled {
    background: @gray-lighter;
}

.select2-more-results.select2-active {
    background: #FFF;
}

.select2-more-results {
    background: @gray-lighter;
}

/* disabled styles */

.select2-container.select2-container-disabled .select2-choice {
    background-color: @gray-lighter;
    border: 1px solid @gray-light;
}

.select2-container.select2-container-disabled .select2-choice .select2-arrow {
    background-color: @gray-lighter;
    background-image: none;
    border-left: 0;
}

.select2-container.select2-container-disabled .select2-choice abbr {
    display: none;
}


/* multiselect */

.select2-container-multi .select2-choices {
    border: 1px solid @select2-border-color;
    background: #fff;
}

.select2-container-multi.select2-container-active .select2-choices {
    border: 1px solid @select2-border-active-color;
}
.select2-container-multi .select2-choices .select2-search-field input {
    color: @gray-darker;
}
.select2-default {
    color: @gray-darker !important;
}

.select2-container-multi .select2-choices .select2-search-choice {
    color: @gray-darker;
    border: 1px solid @select2-border-color;
    background: @gray-lighter;
    filter:none;
}
.select2-container-multi .select2-choices .select2-search-choice-focus {
    background: @gray-light;
}
/* disabled styles */
.select2-container-multi.select2-container-disabled .select2-choices {
    background-color: @gray-lighter;
    border: 1px solid @gray-light;
}

.select2-container-multi.select2-container-disabled .select2-choices .select2-search-choice {
    border: 1px solid @gray-light;
    background-color: @gray-lighter;
}
.lisette-module-bottombar {
    .module-panel-animations();
    position: absolute;
    background: #FFF;
    bottom: 0;
    left: 0;
    right: 0;
    height: @module-bottombar-height;
    text-align: center;
    padding: 0;
    border-top: 1px solid @gray-light;
}
.lisette-module-leftbar {
    .module-panel-animations();
    position: absolute;
    background: @gray-lighter;
    width: @module-leftbar-width;
    top: 0;
    left: 0;
    bottom: 0;
}
.lisette-module-tabs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: @module-tabs-height;

    text-align: center;
    display: block;
    font-size: 0;
    padding-top: @layout-gutter;
    border: none;

    li {
        float: none;
        display: inline-block;
        text-align: center;
        text-transform: uppercase;
        margin: 0;
        font-size: 14px;
        a {
            cursor: pointer;
            color: @gray;
            border: none;
            padding: 8px 20px 6px 20px;
            border-radius: 0;
            margin: 0;
            line-height: 1em;

            &:hover {
                background: transparent;
                color: @gray-dark;
                border: none;
            }
        }
        &.active {
            a {
                cursor: default;
                background: @gray-lighter;
                border: none;
                color: @gray-dark;
                border-radius: @border-radius-base @border-radius-base 0 0;
                &:hover {
                    border: none;
                    background: @gray-lighter;
                    color: @gray-dark;
                }
            }
        }
    }
}

body.state-resolving .lisette-module-tabs li {

    a {
        cursor: not-allowed;
        opacity: .4;
    }
    &.active a {
        cursor: default;
        opacity: 1;
    }
}
.lisette-module-topbar {
    position: absolute;
    background: @gray-lighter;
    top: 0;
    left: 0;
    right: 0;
    height: @module-topbar-height;

    &.version-size-big {
        height: @module-topbar-height-size-big;
    }

    &.version-size-mini {
        height: @module-topbar-height-size-mini;
    }
}

.lisette-module-actionbar {
    padding: 8px;
    padding-left: 0;
    margin-bottom: 0;
    border-bottom: none;

    > .divider {
        display: inline-block;
        height: 100%;
        width: 1px;
        background: @gray-light;
        margin: 0 8px -13px 8px;
    }

    .caret {
        top: -2px;
        position: relative;
    }

    &.version-size-big .btn {
        margin-top: 18px;
    }
}
.lisette-module-notification {
    height: @menu-height;
    border: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: (@zindex-modal-background - 1);
    line-height: @menu-height;
    text-align: center;
    color: #FFF;

    > .inner {
        position: absolute;
        height: 100%;
        width: 100%;
        background: @brand-primary;
        // padding for the close button
        padding-right: 40px;
        .text-overflow();
        &.danger {
            background: @brand-danger;
        }
        &.warning {
            background: @brand-warning;
        }
        &.info {
            background: @brand-info;
        }
        &.success {
            background: @brand-success;
        }
    }

    > .close {
        outline: none;
        position: absolute;
        line-height: @menu-height;
        top: 0;
        color: #FFF;
        box-shadow: none;
        right: 10px;
        opacity: .8;
    }
    
    // ----------------
    // animations
    // ----------------

    .transition(all ease-in-out .3s);
    > .inner {
        opacity: 1;
        .transition(all ease-in-out .3s);
    }

    &.ng-hide-remove,
    &.ng-hide-add {
        display: block!important; // coz ng-hide causes a display: none;
    }

    &.ng-hide-add,
    &.ng-hide-remove.ng-hide-remove-active {
        opacity: 1;
    }

    &.ng-hide-remove,
    &.ng-hide-add.ng-hide-add-active  {
        opacity: 0;
        > .inner {
            background: @brand-primary;
        }
    }
}

.module-bootstrapping {
    .lisette-module-notifications {
        display: none;
    }
}
// always in the bottom bar

.lisette-module-bottombar .pagination {
    margin: 0;
    li {
        a {
            border: none;
            cursor: pointer;
            color: @gray;
        }
        &.active a {
            color: @gray-dark;
            z-index: inherit;
        }
    }
}
/**
 * Search bar featuring a wonderful search text input
 * and filters beneath it
 */

.lisette-module-searchbar {
    @filters-padding: 16px;
    width: 100%;

    @filter-title: @gray;
    @header-color: @gray-dark;

    > .border-top {
        position: absolute;
        height: (@filters-padding/2);
        top: 0;
        left: 0;
        right: 0;
        background-color: @gray-lighter;
        z-index: 1;
    }

    > .inner {
        position: absolute;
        width: 100%;
        height: 100%;
        background: @gray-lighter;
        overflow-x: hidden;
        overflow-y: auto;

        .btn {
            display: block;
        }

        h2 {
            color: @header-color;
            font-size: @font-size-base;
            padding: (@filters-padding + 2px) 0 (@filters-padding + 2px) 0;
            margin: 0 @filters-padding @filters-padding @filters-padding;
            border-bottom: 1px solid @gray-light;
            text-align: center;
            text-transform: uppercase;
        }

        > .searchbox {
            padding: 0 @filters-padding (2*@filters-padding) @filters-padding;
            background: @gray-lighter;

            > .inner {
                padding: 0px;
                position: relative;

                .filters-list {
                    left: 0;
                    right: 2px;
                    border: none;
                    list-style: none;
                    margin: 0;
                    padding: 0;

                    li {
                        position: relative;
                        margin: 0 0 @filters-padding 0;
                        min-height: 26px;
                        > label {
                            .text-overflow();
                            font-weight: normal;
                            line-height: 1.2em;
                            margin-bottom: 0;
                            padding-left: 1px;
                            color: @filter-title;
                            text-transform: uppercase;
                            width: 100%;
                        }
                        &.divider {
                            padding: 0;
                            min-height: 0;
                            margin: @filters-padding 0 @filters-padding 0;
                            height: 1px;
                            border-bottom: 1px dotted @gray-light;
                        }
                        &:after {
                            content: '';
                            display: block;
                            clear: both;
                            height: 0;
                        }
                        .control {
                            overflow: hidden;
                            position: relative;
                            input,
                            .select2-container {
                                width: 100%;
                                display: block;
                                box-shadow: none;
                            }

                            /**
                             * Fix the double arrow (on retina) on select2 fields
                             */
                            .select2-container {
                                .select2-choice .select2-arrow b {
                                    background-image: none !important;
                                }
                            }

                            input {
                                border: 1px solid @gray-light;
                                padding: 2px 6px;
                                border-radius: @border-radius-base;
                                outline: none;
                            }
                            .clear {
                                border: none;
                                background: none;
                                position: absolute;
                                right: 0;
                                top: 0;
                                color: @gray;
                                font-size: 20px;
                                line-height: 32px;
                                text-align: center;
                                width: 25px;
                                height: 100%;
                                display: inline-block;
                                padding-left: 3px;
                                border-left: 1px solid @gray-lighter;
                                outline: none;
                            }
                        }
                        .checkboxes,
                        .radioboxes {
                            list-style: none;
                            padding: 4px 0 0 0;

                            > li {
                                margin: 0;
                                padding: 0;
                                label {
                                    color: @gray-darker;
                                    text-transform: none;

                                    & > * {
                                        vertical-align: middle;
                                    }

                                    span {
                                        padding-left: 5px;
                                    }
                                }
                            }
                            .radiobox,
                            .checkbox {
                                margin: 0 3px 0 0;
                                width: 14px;
                                height: 14px;
                                max-width: 14px;
                                max-height: 14px;
                                float: left;
                            }

                            .state {
                                float: left;
                                display: block;
                                position: relative;
                                top: 1px;
                                left: 1px;
                                vertical-align: middle;
                            }
                        }
                        .dates {
                            font-size: 0;
                            .control {
                                width: 50%;
                                display: inline-block;
                                &:first-child input {
                                    border-top-right-radius: 0;
                                    border-bottom-right-radius: 0;
                                    border-right: 1px solid @gray-light;
                                }
                                &:last-child input {
                                    margin-left: -1px;
                                    border-left: 1px solid @gray-light;
                                    border-top-left-radius: 0;
                                    border-bottom-left-radius: 0;
                                }
                                input[readonly] {
                                    cursor: pointer;
                                    background: #FFF;
                                }
                            }
                        }
                    }
                }

                .filters-actions {
                    padding: 0;
                    margin: @filters-padding 0 0 0;
                    .btn {
                        display: block;
                        padding: 5px;
                        &.btn-primary {
                            color: #FFF;
                            .ev-btn(@brand-primary);
                        }
                        &.btn-default {
                            .ev-btn(@gray-light);
                        }
                    }
                    .filters-submit {
                        width: 100%;
                        display: block;
                        text-align: center;
                        padding: (@filters-padding/2);

                        .icon {
                            margin-right: (@filters-padding/2);
                        }
                    }
                    .filters-save {
                        display: block;
                        color: @gray;
                        font-size: 12px;
                        line-height: 1.5em;
                    }
                }
            }
        }
    }
}

// media query TO BE UPDATED
.lisette-module-leftbar[max-width~="250px"] .lisette-module-searchbar {
    display: none;
}
/*************************************************************************************
 * BUTTONS
 *************************************************************************************/

.btn-link-danger.btn-link {
  color: @brand-danger;
}

.btn-default.active {
    box-shadow: none;
    color: #444;
}

.btn {
    text-transform: uppercase;
    outline: none !important;
    border: 1px solid @gray-light;
    margin-right: 3px;
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 7px;
    padding-bottom: 7px;
    box-shadow: none;

    .icon {
        margin-right: 5px;
    }
}

.ev-btn(@color) {
    background: @color;
    &:hover {
        background: lighten(@color, 4%);
    }
    &:active {
        background: darken(@color, 2%);
    }
    &.btn-xs,
    &.btn-sm,
    &.btn-xs:hover,
    &.btn-xs:active,
    &.btn-sm:hover,
    &.btn-sm:active {
        box-shadow: none;
    }
}

.btn-default { .ev-btn(@gray-lighter); }
.btn-danger { .ev-btn(@brand-danger); }
.btn-info { .ev-btn(@brand-info); }
.btn-warning { .ev-btn(@brand-warning); }
.btn-primary { .ev-btn(@brand-primary); }

.btn-primary {
  border: none;
}

.btn-primary[disabled] {
    background-color: @gray;
}

.btn-default {
    background: transparent;
    color: @gray-dark;
    &:hover {
        box-shadow: none;
        border-color: @gray-light;
    }
    &:active {
        box-shadow: none;
        opacity: .6;
    }
}

.dropdown {
    list-style: none;
    display: inline-block;
}

.open .dropdown-toggle.btn-default {
    background: lighten(@gray-lighter, 4%);
    border-color: @gray-light;
}

.dropdown-menu {
  cursor: pointer;
  border: 1px solid @gray-light;
}
label {
    font-weight: normal;
    cursor: pointer;
}

.form-horizontal {
    .form-group {
        margin-left: 0;
        margin-right: 0;

        label {
            text-align: left;
            color: @gray;
            padding-left: 3px;
        }
    }
}

.form-group {

    & > label {
        .text-overflow();
        padding-right: 0;
    }

    .error {
        margin-top: 5px;
        display: none;
        color: @brand-danger;
        font-style: italic;
        font-family: @font-family-serif;
    }

    &.has-error {
        .error {
            display: block;
        }
        .form-control:hover,
        .form-control:focus {
            border-color: @brand-danger;
            box-shadow: none;
        }
    }
}

.form-control {
    padding: @padding-base-vertical (@padding-base-vertical + 2px);
    border-width: 1px;
    box-shadow: none;

    &:hover {
        border-color: @gray;
    }

    &:focus {
        border-color: @brand-primary;
        box-shadow: none;
    }
}

select.form-control {
    border-width: 1px;
}
@import "buttons.less";
@import "forms.less";
@import "modals.less";
@import "tables.less";
@import "tooltip.less";
.modal-backdrop {
    z-index: @zindex-modal-background;
}

.modal {
    outline: none;
    .modal-dialog {
        padding-top: 80px;
        .modal-content {
            border: none;
        }
        .modal-header {
            padding: 9px 16px;
            background: @gray-lighter;
            border-bottom: none;

            .modal-title {
                font-size: 20px;
                text-transform: uppercase;
                line-height: 1.7em;
                margin-right: 30px;
                .text-overflow();
            }
            .close {
                font-size: 32px;
                color: @gray;
                opacity: 1;
                margin-top: 0;
                margin-right: -14px;
                width: 50px;
                height: 100%;
                box-shadow: none;
                text-shadow: none;
                outline: none;

                &:hover {
                    color: @gray-dark;
                }
            }
        }

        .modal-footer {
            margin-top: 0;
            .btn {
                margin-left: 10px;
                min-width: 150px;
                &:first-child {
                    margin-left: 0;
                }
            }
            background-color: @gray-lighter;
        }

        .modal-body.modal-message {
            text-align: center;
            font-size: 24px;
            padding: 40px 20px;
        }
        .modal-body h4 {
            margin-top: 20px;
            color: @gray;
            text-transform: uppercase;
            font-size: 14px;
            margin-bottom: 10px;
            &:first-child {
                margin-top: 0px;
            }
        }

        @media(min-width: @screen-tablet) {
            width: 750px;
        }
    }

    @media(max-width: @screen-tablet) {

        z-index: @zindex-modal-background;
        background: #FFF;

        .modal-dialog {
            padding: 0;

            .modal-content {
                border: none;
                border-radius: 0;
                box-shadow: none;
            }

            .modal-body.modal-message {
                font-size: 18px;
                padding: 20px;
            }
        }
    }

    /**
     * Error version of the popup
     */
    &.error {
        .modal-dialog {
            color: @brand-danger;
            // extends small dialog
            .modal.small .modal-dialog;
            .modal-header {
                display: none;
            }
            .modal-footer {
                text-align: center;
                .btn {
                    .btn-danger;
                }
                background-color: @gray-lighter;
            }
            .modal-body {
                text-align: center;
                font-size: @font-size-large;
                &:before {
                    &:extend(.icon-emo-sad all);
                    content: "\e617";
                    font-size: 80px;
                    margin-bottom: 20px;
                }
            }
        }
    }

    /**
     * Small version of the popup
     */
    &.small .modal-dialog {
        @media(min-width: @screen-tablet) {
            width: 500px;
        }
    }

    /**
     * Big version of the popup
     */
    &.big .modal-dialog {
        @media(min-width: @screen-tablet) {
            width: 900px;
        }
    }

    /**
     * This was a nightmare to position
     */
    &.right {
        position: fixed;
        right: 0;
        top: @menu-height;
        bottom: 0;
        left: auto;
        width: 550px;
        overflow: visible;
        // actual bs modals should overlay
        // our right affixed evaneos modals
        // AND menu dropdowns
        // BS handles z-index himself, we have to use important here
        z-index: (@zindex-modal-background - 4) !important;

        &.big {
            width: 750px;
        }

        .modal-dialog {
            padding: 0;
            width: 100%;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            box-shadow: 0 0 10px rgba(0,0,0,.3);

            .modal-content {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                box-shadow: none;
                overflow-x: hidden;
                overflow-y: auto;
                border-radius: 0;
                box-shadow: none;
                border-left: 5px solid @gray-lighter;

                .modal-header {
                    position: inherit !important;
                    padding: 10px 10px 14px 10px;

                    .modal-action-bar {
                        margin-top: 3px;
                    }
                }

                .modal-body {
                    position: inherit !important;
                    overflow-x: hidden;
                    overflow-y: auto;
                    padding-top: 10px;
                    padding-left: 10px;

                    .common-data {
                        margin-left: 5px;
                        margin-right: 5px;
                    }

                    hr {
                        border-top: 5px solid @gray-lighter;
                        margin: 20px -20px;
                    }

                    &.no-footer {
                        bottom: 0px;
                    }
                    &.no-header {
                        top: 0px;
                    }
                }

                .modal-footer {
                    position: absolute;
                    bottom: 0; left: 0; right: 0;
                    border-top: 5px solid @gray-lighter;
                    background-color: @gray-lighter;
                }
            }
        }

        // replace the from-top animation
        // by a from-right
        &.fade {
            .modal-dialog {
                .translate(25%, 0);
            }
            &.in {
                .modal-dialog {
                    .translate(0, 0);
                }
            }
        }

        // On mobile screens, popup take the whole
        // screen, and show up without animations
        @media(max-width: @screen-tablet) {
            width: auto;
            left: 0;

            &.fade,
            &.fade .modal-dialog {
                transition: none !important;
            }
        }
    }
}

/**
 * Re-enable body scroll when a popup is opened
 * (This aws set by Tw bootstrap to prevent body scroll)
 */
body.modal-open {
    overflow: auto !important;
}
// Reset
@import "bootstrap/less/normalize.less";
@import "bootstrap/less/print.less";

// Core CSS
@import "bootstrap/less/scaffolding.less";
@import "bootstrap/less/type.less";
@import "bootstrap/less/code.less";
@import "bootstrap/less/grid.less";
@import "bootstrap/less/tables.less";
@import "bootstrap/less/forms.less";
@import "bootstrap/less/buttons.less";

// Components
@import "bootstrap/less/component-animations.less";
@import "bootstrap/less/glyphicons.less";
@import "bootstrap/less/dropdowns.less";
@import "bootstrap/less/button-groups.less";
@import "bootstrap/less/input-groups.less";
@import "bootstrap/less/navs.less";
@import "bootstrap/less/navbar.less";
@import "bootstrap/less/breadcrumbs.less";
@import "bootstrap/less/pagination.less";
@import "bootstrap/less/pager.less";
//@import "bootstrap/less/labels.less";
//@import "bootstrap/less/badges.less";
//@import "bootstrap/less/jumbotron.less";
//@import "bootstrap/less/thumbnails.less";
@import "bootstrap/less/alerts.less";
// @import "bootstrap/less/progress-bars.less";
// @import "bootstrap/less/media.less";
// @import "bootstrap/less/list-group.less";
// @import "bootstrap/less/panels.less";
// @import "bootstrap/less/wells.less";
@import "bootstrap/less/close.less";

// Components w/ JavaScript
@import "bootstrap/less/modals.less";
@import "bootstrap/less/tooltip.less";
// @import "bootstrap/less/popovers.less";
// @import "bootstrap/less/carousel.less";

// Utility classes
@import "bootstrap/less/utilities.less";
@import "bootstrap/less/responsive-utilities.less";
table.table {
    margin: 0;
    thead > tr > th {
        font-weight: normal;
        font-size: 12px;
        border-bottom: none;
        color: @gray;
    }
    > thead > tr > th,
    > tbody > tr > th,
    > tfoot > tr > th,
    > thead > tr > td,
    > tbody > tr > td,
    > tfoot > tr > td {
        border-top: none;
        border-bottom: 1px solid @gray-light;
    }
    td {
        min-width: 50px;
    }
    // remove first / last paddings
    td:first-child {
        padding-left: 7px;
    }
    th:first-child {
        padding-left: 6px;
    }
    td:last-child,
    th:last-child {
        padding-right: 10px;
    }

    @headers-height: 33px;
    &.fixed-headers {
        thead {
            width: 100%;
            position: fixed;
            z-index: 1;
            background: #FFF;
            tr {
                width: 100%;
                th {
                    height: @headers-height;
                    background: #FFF;
                    .text-overflow();
                }
            }
        }
        tbody tr:first-child {
            border-top: @headers-height solid transparent;
        }
    }

    tr {
        border-left: @layout-gutter solid transparent;
        &.active {
            border-left: @layout-gutter solid @brand-primary;
        }
        &[activable] {
            cursor: pointer;
        }
    }
}
.tooltip {
  font-weight: bold;

  .tooltip-small {
    font-style: italic;
    font-size: 11px;
  }

  .white-space {
    white-space: pre-wrap;
  }
}