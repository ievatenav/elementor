export default class GlobalControlSelect extends Marionette.Behavior {
	ui() {
		return {
			controlContent: '.elementor-control-content',
		};
	}

	// This method exists because the UI elements are printed after controls are already rendered
	registerUiElements() {
		this.ui.globalPreviewsContainer = this.popover.getElements( 'widget' ).find( '.elementor-global-previews-container' );
		this.ui.globalPreviewItems = this.popover.getElements( 'widget' ).find( '.elementor-global-preview' );
		this.ui.globalControlSelect = this.$el.find( '.elementor-global-select' );
		this.ui.globalControlSelected = this.$el.find( '.elementor-global-selected' );
	}

	// This method exists because the UI elements are printed after controls are already rendered
	registerEvents() {
		this.ui.globalPreviewItems.on( 'click', ( event ) => this.applySavedGlobalValue( event ) );
		this.ui.globalControlSelect.on( 'click', ( event ) => this.toggleSelect( event ) );
	}

	applySavedGlobalValue( event ) {
		const previewData = event.currentTarget.dataset;

		this.ui.globalControlSelected.html( previewData.elementorGlobalName );

		this.toggleSelect();
	}

	// The Global Control elements are initialized onRender and not with initialize() because their position depends
	// on elements that are not yet rendered when initialize() is called.
	onRender() {
		this.printGlobalSelectBox();

		this.initGlobalPopover();

		this.$el.addClass( 'elementor-control-global' );

		// Instead of ui()
		this.registerUiElements();

		// Instead of events()
		this.registerEvents();
	}

	toggleSelect() {
		if ( this.popover.isVisible() ) {
			this.popover.hide();
		} else {
			this.popover.show();
		}
	}

	buildGlobalPopover() {
		const $popover = jQuery( '<div>', { class: 'elementor-global-popover-container' } ),
			$popoverTitle = jQuery( '<div>', { class: 'elementor-global-popover-title' } )
				.html( '<i class="eicon-info-circle"></i>' + this.getOption( 'popoverTitle' ) ),
			$manageGlobalPresetsLink = jQuery( '<div>', { class: 'elementor-global-manage-button' } )
				.html( this.getOption( 'manageButtonText' ) + '<i class="eicon-cog"></i>' );

		$popover.append( $popoverTitle, this.getOption( 'popoverContent' ), $manageGlobalPresetsLink );

		return $popover;
	}

	// This method is not called directly, but triggered by Marionette's .triggerMethod()
	onAddGlobalToList( $confirmMessage ) {
		elementorCommon.dialogsManager.createWidget( 'confirm', {
			className: 'elementor-global-confirm-add',
			headerMessage: this.getOption( 'newGlobalConfirmTitle' ),
			message: $confirmMessage,
			strings: {
				confirm: elementor.translate( 'create' ),
				cancel: elementor.translate( 'cancel' ),
			},
			hide: {
				onBackgroundClick: false,
			},
			onConfirm: () => {
				const globalData = $confirmMessage.data( 'globalData' );

				globalData.name = this.globalNameInput.val();

				const $globalPreview = this.view.createGlobalPreviewMarkup( globalData );

				this.ui.globalPreviewsContainer.append( $globalPreview );
			},
			onShow: () => {
				// Put focus on the naming input
				this.globalNameInput = jQuery( '.elementor-global-confirm-add input' )
					.focus();
			},
		} ).show();
	}

	createGlobalInfoTooltip() {
		const $infoIcon = this.popover.getElements( 'widget' ).find( '.elementor-global-popover-title .eicon-info-circle' );

		this.globalInfoTooltip = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'elementor-global-info-tooltip',
			message: this.getOption( 'tooltipText' ),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			position: {
				my: `left bottom`,
				at: `left top+9`,
				of: this.popover.getElements( 'widget' ),
				autoRefresh: true,
			},
		} );

		$infoIcon.on( {
			mouseenter: () => this.globalInfoTooltip.show(),
			mouseleave: () => this.globalInfoTooltip.hide(),
		} );
	}

	printGlobalSelectBox() {
		const $globalSelectBox = jQuery( '<div>', { class: 'elementor-global-select' } ),
			$selectedGlobal = jQuery( '<span>', { class: 'elementor-global-selected' } )
				.html( elementor.translate( 'default' ) );

		$globalSelectBox.append( $selectedGlobal, '<i class="eicon-caret-down"></i>' );

		this.$el.find( '.elementor-control-input-wrapper' ).prepend( $globalSelectBox );
	}

	initGlobalPopover() {
		this.popover = elementorCommon.dialogsManager.createWidget( 'simple', {
			className: 'elementor-global-control-popover',
			message: this.buildGlobalPopover(),
			effects: {
				show: 'show',
				hide: 'hide',
			},
			hide: {
				onOutsideClick: false,
			},
			position: {
				my: `center top`,
				at: `center bottom+5`,
				of: this.ui.controlContent,
				autoRefresh: true,
			},
		} );

		this.createGlobalInfoTooltip();
	}
}