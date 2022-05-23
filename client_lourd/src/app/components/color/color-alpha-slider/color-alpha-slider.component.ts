import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Color } from '@app/classes/color';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { ColorService } from '@app/services/tools/color/color.service';

// This componenent was inspiered by:
// Author: L. Marx, “Creating a Color Picker Component with Angular,” malcoded, 18-Sep-2018. [Online].
// Available: https://malcoded.com/posts/angular-color-picker/. [Accessed: 01-Feb-2021].
@Component({
    selector: 'app-color-alpha-slider',
    templateUrl: './color-alpha-slider.component.html',
    styleUrls: ['./color-alpha-slider.component.scss'],
})
export class ColorAlphaSliderComponent implements AfterViewInit, OnInit {
    checked: boolean = false;
    constructor(public colorService: ColorService, public toolsInfoService: ToolsInfoService, public changingToolsService: ChangingToolsService) {}

    ngOnInit(): void {
        this.colorService.selectedColorChangedListener().subscribe(() => this.updateAlphaSlider());
        this.colorService.colorClickedListener().subscribe(() => {
            this.updateAlphaSlider();
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.updateAlphaSlider();
        });
    }

    toggleAlphaSlider(): void {
        this.colorService.secondaryColor.a = this.checked ? 0 : Color.MAX_ALPHA;
    }

    updateAlphaSlider(): void {
        this.checked = this.colorService.secondaryColor.a === 0;
    }
}
