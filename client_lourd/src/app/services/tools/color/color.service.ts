import { Injectable } from '@angular/core';
import { Color } from '@app/classes/color';
import { Observable, Subject } from 'rxjs';

export const enum ColorInstance {
    PRIMARY = 0,
    SECONDARY = 1,
    TEXT = 2,
}

const wohonid = 100;
@Injectable({
    providedIn: 'root',
})
export class ColorService {
    primaryColorProp: Color = new Color(0, 0, 0, 1);
    secondaryColorProp: Color = new Color(0, 0, wohonid, 1);
    textColorProp: Color = new Color(0, 0, 0, 1);
    colorInstance: ColorInstance = ColorInstance.PRIMARY;
    selectedColorChanged: Subject<null> = new Subject<null>();
    colorChanged: Subject<null> = new Subject<null>();
    private colorClicked: Subject<null> = new Subject<null>();

    get primaryColor(): Color {
        return this.primaryColorProp;
    }
    set primaryColor(color: Color) {
        if (this.colorInstance === ColorInstance.PRIMARY) {
            this.primaryColorProp = color;
            this.emitSelectedColorChanged();
        }
    }
    get secondaryColor(): Color {
        return this.secondaryColorProp;
    }
    set secondaryColor(color: Color) {
        if (this.colorInstance === ColorInstance.SECONDARY) {
            this.secondaryColorProp = color;
            this.emitSelectedColorChanged();
        }
    }

    get textColor(): Color {
        return this.textColorProp;
    }
    set textColor(color: Color) {
        if (this.colorInstance === ColorInstance.TEXT) {
            this.textColorProp = color;
            this.emitSelectedColorChanged();
        }
    }

    // Selected Color
    get selectedColor(): Color {
        let color = this.primaryColor;
        switch (this.colorInstance) {
            case ColorInstance.PRIMARY: {
                color = this.primaryColor;
                break;
            }
            case ColorInstance.SECONDARY: {
                color = this.secondaryColor;
                break;
            }
            case ColorInstance.TEXT: {
                color = this.textColor;
                break;
            }
        }
        return color;
    }
    set selectedColor(color: Color) {
        switch (this.colorInstance) {
            case ColorInstance.PRIMARY: {
                this.primaryColor = color;
                return;
            }
            case ColorInstance.SECONDARY: {
                this.secondaryColor = color;
                return;
            }
            case ColorInstance.TEXT: {
                this.textColor = color;
                return;
            }
        }
    }

    // Selected Color Hue
    set selectedColorHue(hue: number) {
        this.selectedColor.h = hue;
        this.emitSelectedColorChanged();
    }

    // Selected Color Saturation
    set selectedColorSaturation(saturation: number) {
        this.selectedColor.s = saturation;
        this.emitSelectedColorChanged();
    }

    // Selected Color Luminance
    set selectedColorLuminance(luminance: number) {
        this.selectedColor.l = luminance;
        this.emitSelectedColorChanged();
    }

    // Selected Color Alpha
    set selectedColorAlpha(alpha: number) {
        this.selectedColor.a = alpha;
        this.emitSelectedColorChanged();
    }

    get colorTitle(): string {
        let title = 'intérieure';
        switch (this.colorInstance) {
            case ColorInstance.PRIMARY: {
                title = 'trait';
                break;
            }
            case ColorInstance.SECONDARY: {
                title = 'intérieure';
                break;
            }
            case ColorInstance.TEXT: {
                title = 'texte';
                break;
            }
        }
        return title;
    }

    emitSelectedColorChanged(): void {
        this.selectedColorChanged.next();
        this.colorChanged.next();
    }

    selectedColorChangedListener(): Observable<null> {
        return this.selectedColorChanged.asObservable();
    }

    colorChangedListener(): Observable<null> {
        return this.colorChanged.asObservable();
    }

    swapPrimaryAndSecondaryColors(): void {
        this.colorInstance = ColorInstance.PRIMARY;
        const temporaryColor: Color = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = temporaryColor;
    }

    emitColorClicked(): void {
        this.colorClicked.next();
    }
    colorClickedListener(): Observable<null> {
        return this.colorClicked.asObservable();
    }

    primaryColorClicked(): void {
        this.colorInstance = ColorInstance.PRIMARY;
        this.emitColorClicked();
    }

    secondaryColorClicked(): void {
        this.colorInstance = ColorInstance.SECONDARY;
        this.emitColorClicked();
    }

    textColorClicked(): void {
        this.colorInstance = ColorInstance.TEXT;
        this.emitColorClicked();
    }
}
