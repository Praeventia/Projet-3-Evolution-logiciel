import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Color } from '@app/classes/color';
import { ColorHexComponent } from '@app/components/color/color-hex/color-hex.component';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorInstance, ColorService } from '@app/services/tools/color/color.service';
import { SelectionService } from '@app/services/tools/selection/selection.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.scss'],
})
export class ColorPickerComponent implements OnInit {
    @ViewChild('container') private container: ElementRef;
    isHidden: boolean = true;

    @ViewChild('colorHex') colorHex: ColorHexComponent;
    previousColor: Color;

    constructor(
        public colorService: ColorService,
        private keyEventService: KeyEventService,
        private snackBarService: SnackBarService,
        public toolsInfoService: ToolsInfoService,
        public changingToolsService: ChangingToolsService,
        public selectionService: SelectionService,
    ) {}

    ngOnInit(): void {
        this.colorService.colorClickedListener().subscribe(() => this.showColorPicker());
        this.keyEventService.getKeyDownEvent('Escape').subscribe(() => this.cancelSelectedColor());
    }

    @HostListener('window:mousedown', ['$event'])
    onMouseDown(event: Event): void {
        this.detectOutsideClick(event);
    }

    private detectOutsideClick(event: Event): void {
        // We want to accept the selected color if there was a click outside.
        if (this.clickWasOutside(event)) {
            this.acceptSelectedColor();
        }
    }

    private clickWasOutside(event: Event): boolean {
        return event.target !== this.container?.nativeElement;
    }

    private showColorPicker(): void {
        this.isHidden = false;
        this.previousColor = this.colorService.selectedColor.copy();
    }

    cancelSelectedColor(): void {
        if (this.isHidden) return;
        this.colorService.selectedColor = this.previousColor.copy();
        this.isHidden = true;
    }

    acceptSelectedColor(): void {
        if (this.isHidden) return;
        if (this.colorHex.hexColorFormControl.invalid) return this.snackBarService.openSnackBar('La couleur choisie est invalide');
        this.isHidden = true;
        this.selectionService.changeCommandColor();
    }

    showAlphaSlider(): boolean {
        return this.colorService.colorInstance === ColorInstance.SECONDARY;
    }

    getSelectedColor(): string {
        let value = 'Principale';
        switch (this.colorService.colorInstance) {
            case ColorInstance.PRIMARY: {
                value = 'Principale';
                break;
            }
            case ColorInstance.SECONDARY: {
                value = 'Secondaire';
                break;
            }
            case ColorInstance.TEXT: {
                value = 'Text';
                break;
            }
        }
        return value;
    }

    onPrimaryColorClicked(): void {
        // We don't want to accept the color if the selected color is already primary
        if (this.colorService.colorInstance === ColorInstance.PRIMARY) return;
        this.acceptSelectedColor();
        this.colorService.primaryColorClicked();
    }

    onSecondaryColorClicked(): void {
        // We don't want to accept the color if the selected color is already secondary
        if (this.colorService.colorInstance === ColorInstance.SECONDARY) return;
        this.acceptSelectedColor();
        this.colorService.secondaryColorClicked();
    }

    onTextColorClicked(): void {
        // We don't want to accept the color if the selected color is already text
        if (this.colorService.colorInstance === ColorInstance.TEXT) return;
        this.acceptSelectedColor();
        this.colorService.textColorClicked();
    }
}
