import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { PrimeNG } from 'primeng/config';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from '../service/layout.service';

const presets = {
    Aura,
    Lara,
    Nora
} as const;

// DAZ BRAND PALETTES (Derived from your logo)
const dazNavy = {
    50: '#E6EBF0', 100: '#CCD7E1', 200: '#99AFC3', 300: '#6687A5', 400: '#335F87',
    500: '#003366', // Primary Logo Navy
    600: '#002E5C', 700: '#002952', 800: '#002447', 900: '#001F3D', 950: '#001A33'
};

const dazSteel = {
    50: '#F2F4F5', 100: '#E5E9EB', 200: '#CCD3D7', 300: '#B2BDC3', 400: '#99A7AF',
    500: '#7F919B', // Metallic Steel Accent
    600: '#72838C', 700: '#66747C', 800: '#59666D', 900: '#4C575D', 950: '#40494E'
};

declare type KeyOfType<T> = keyof T extends infer U ? U : never;

declare type SurfacesType = {
    name?: string;
    palette?: {
        0?: string; 50?: string; 100?: string; 200?: string; 300?: string; 400?: string;
        500?: string; 600?: string; 700?: string; 800?: string; 900?: string; 950?: string;
    };
};

@Component({
    selector: 'app-configurator',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectButtonModule],
    template: `
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-color font-semibold">Brand Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <button
                            type="button"
                            [title]="primaryColor.name"
                            (click)="updateColors($event, 'primary', primaryColor)"
                            [ngClass]="{ 'outline outline-primary': primaryColor.name === selectedPrimaryColor() }"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center outline-offset-1 shadow transition-transform active:scale-90"
                            [style]="{
                                'background-color': primaryColor?.name === 'noir' ? 'var(--text-color)' : primaryColor?.palette?.['500']
                            }"
                        >
                        </button>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">Surface (Backgrounds)</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (surface of surfaces; track surface.name) {
                        <button
                            type="button"
                            [title]="surface.name"
                            (click)="updateColors($event, 'surface', surface)"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center p-0 outline-offset-1 shadow"
                            [ngClass]="{
                                'outline outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : layoutService.layoutConfig().darkTheme ? surface.name === 'zinc' : surface.name === 'slate'
                            }"
                            [style]="{ 'background-color': surface?.palette?.['500'] }"
                        ></button>
                    }
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Presets</span>
                <p-selectbutton [options]="presets" [ngModel]="selectedPreset()" (ngModelChange)="onPresetChange($event)" [allowEmpty]="false" size="small" />
            </div>
            <div *ngIf="showMenuModeButton()" class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
                <p-selectbutton [ngModel]="menuMode()" (ngModelChange)="onMenuModeChange($event)" [options]="menuModeOptions" [allowEmpty]="false" size="small" />
            </div>
        </div>
    `,
    host: {
        class: 'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-xl'
    }
})
export class AppConfigurator {
    router = inject(Router);
    config: PrimeNG = inject(PrimeNG);
    layoutService: LayoutService = inject(LayoutService);
    platformId = inject(PLATFORM_ID);
    presets = Object.keys(presets);
    showMenuModeButton = signal(!this.router.url.includes('auth'));

    menuModeOptions = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    // RESTRICTED TO LOGO COLORS ONLY
    primaryColors = computed<SurfacesType[]>(() => {
        return [
            { name: 'navy', palette: dazNavy },
            { name: 'steel', palette: dazSteel },
            { name: 'noir', palette: {} }
        ];
    });

    surfaces: SurfacesType[] = [
        { name: 'slate', palette: { 0: '#ffffff', 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' } },
        { name: 'gray', palette: { 0: '#ffffff', 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' } },
        { name: 'zinc', palette: { 0: '#ffffff', 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' } },
        { name: 'ocean', palette: { 0: '#ffffff', 50: '#fbfcfc', 100: '#F7F9F8', 200: '#EFF3F2', 300: '#DADEDD', 400: '#B1B7B6', 500: '#828787', 600: '#5F7274', 700: '#415B61', 800: '#29444E', 900: '#183240', 950: '#0c1920' } }
    ];

    selectedPrimaryColor = computed(() => this.layoutService.layoutConfig().primary);
    selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);
    selectedPreset = computed(() => this.layoutService.layoutConfig().preset);
    menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.onPresetChange(this.layoutService.layoutConfig().preset);
        }
    }

    getPresetExt() {
        const color = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || this.primaryColors()[0];

        if (color.name === 'noir') {
            return {
                semantic: {
                    primary: { 50: '{surface.50}', 100: '{surface.100}', 200: '{surface.200}', 300: '{surface.300}', 400: '{surface.400}', 500: '{surface.500}', 600: '{surface.600}', 700: '{surface.700}', 800: '{surface.800}', 900: '{surface.900}', 950: '{surface.950}' },
                    colorScheme: {
                        light: { primary: { color: '{primary.950}', contrastColor: '#ffffff', hoverColor: '{primary.800}', activeColor: '{primary.700}' } },
                        dark: { primary: { color: '{primary.50}', contrastColor: '{primary.950}', hoverColor: '{primary.200}', activeColor: '{primary.300}' } }
                    }
                }
            };
        }

        // Apply DAZ Palettes (Navy/Steel)
        return {
            semantic: {
                primary: color.palette,
                colorScheme: {
                    light: {
                        primary: {
                            color: '{primary.500}',
                            contrastColor: '#ffffff',
                            hoverColor: '{primary.600}',
                            activeColor: '{primary.700}'
                        }
                    },
                    dark: {
                        primary: {
                            color: '{primary.400}',
                            contrastColor: '{surface.900}',
                            hoverColor: '{primary.300}',
                            activeColor: '{primary.200}'
                        }
                    }
                }
            }
        };
    }

    updateColors(event: any, type: string, color: any) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
        } else if (type === 'surface') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
        }
        this.applyTheme(type, color);
        event.stopPropagation();
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    onPresetChange(event: any) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
        const preset = presets[event as KeyOfType<typeof presets>];
        const surfacePalette = this.surfaces.find((s) => s.name === this.selectedSurfaceColor())?.palette;
        $t().preset(preset).preset(this.getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
    }

    onMenuModeChange(event: string) {
        this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event }));
    }
}
