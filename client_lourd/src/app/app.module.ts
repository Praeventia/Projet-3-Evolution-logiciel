import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/app-routing.module';
import { AppComponent } from '@app/components/app/app.component';
import { ColorAlphaSliderComponent } from '@app/components/color/color-alpha-slider/color-alpha-slider.component';
import { ColorHexComponent } from '@app/components/color/color-hex/color-hex.component';
import { ColorHueSliderComponent } from '@app/components/color/color-hue-slider/color-hue-slider.component';
import { ColorPaletteComponent } from '@app/components/color/color-palette/color-palette.component';
import { ColorPickerComponent } from '@app/components/color/color-picker/color-picker.component';
import { ColorSwatchComponent } from '@app/components/color/color-swatch/color-swatch.component';
import { ColorComponent } from '@app/components/color/color/color.component';
import { ConfirmationDialogComponent } from '@app/components/confirmation-dialog/confirmation-dialog.component';
import { DrawingComponent } from '@app/components/drawing/drawing.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { SelectionComponent } from '@app/components/selection/selection.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { MaterialModule } from '@app/modules/material.module';
import { ChangingToolsService } from '@app/services/changing-tools/changing-tools.service';
import { CommandsService } from '@app/services/commands-service/commands.service';
import { HttpService } from '@app/services/http/http.service';
import { KeyEventService } from '@app/services/key-event/key-event.service';
import { SnackBarService } from '@app/services/snack-bar/snack-bar.service';
import { TextService } from '@app/services/text/text.service';
import { ToolsBoxService } from '@app/services/tools-box/tools-box.service';
import { ToolsInfoService } from '@app/services/tools-info/tools-info.service';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ActiveUsersComponent } from './components/active-users/active-users.component';
import { AlbumDrawingComponent } from './components/album/album-drawing/album-drawing.component';
import { AlbumDrawingsComponent } from './components/album/album-drawings/album-drawings.component';
import { AlbumNotificationComponent } from './components/album/album-notification/album-notification.component';
import { AlbumComponent } from './components/album/album/album.component';
import { AlbumsDeDessinsComponent } from './components/album/albums-de-dessins/albums-de-dessins.component';
import { CreateAlbumComponent } from './components/album/create-album/create-album.component';
import { CreateDrawingComponent } from './components/album/create-drawing/create-drawing.component';
import { DrawingPasswordComponent } from './components/album/drawing-password/drawing-password.component';
import { EditAlbumComponent } from './components/album/edit-album/edit-album.component';
import { EditDrawingComponent } from './components/album/edit-drawing/edit-drawing.component';
import { ExpositionComponent } from './components/album/exposition/exposition.component';
import { CanalComponent } from './components/canaux/canal/canal.component';
import { ChatCanauxComponent } from './components/canaux/canaux-display/canaux-display.component';
import { CreateCanalComponent } from './components/canaux/create-canal/create-canal.component';
import { ChatUserBubbleComponent } from './components/chat/chat-bubbles//chat-user-bubble/chat-user-bubble.component';
import { ChatOthersBubbleComponent } from './components/chat/chat-bubbles/chat-others-bubble/chat-others-bubble.component';
import { ChatButtonComponent } from './components/chat/chat-button/chat-button.component';
import { ChatRoomComponent } from './components/chat/chat-display/chat-display.component';
import { ChatComponent } from './components/chat/chat/chat.component';
import { ConcoursPageComponent } from './components/concours/concours-page/concours-page.component';
import { ConcoursWeekComponent } from './components/concours/concours-week/concours-week.component';
import { EntriesPageComponent } from './components/concours/entries-page/entries-page.component';
import { EntryComponent } from './components/concours/entry/entry.component';
import { SoumissionPageComponent } from './components/concours/soumission-page/soumission-page.component';
import { WinnerComponent } from './components/concours/winner/winner.component';
import { DessinsPageComponent } from './components/dessins/dessins-page/dessins-page.component';
import { EditAvatarComponent } from './components/edit-avatar/edit-avatar.component';
import { EditInfoComponent } from './components/edit-info/edit-info.component';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';
import { LayersListComponent } from './components/layers-list/layers-list.component';
import { LeaderboardPageComponent } from './components/leaderboard/leaderboard-page/leaderboard-page.component';
import { LeaderboardWinnerComponent } from './components/leaderboard/leaderboard-winner/leaderboard-winner.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard/leaderboard.component';
import { LoginHistoryComponent } from './components/login-history/login-history.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SidebarPropertiesComponent } from './components/sidebar-properties/sidebar-properties.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { AlbumService } from './services/album/album.service';
import { AvatarService } from './services/avatar/avatar.service';
import { CanauxService } from './services/canaux/canaux.service';
import { ChatHandlerService } from './services/chat-handler/chat-handler.service';
import { ChatService } from './services/chat/chat.service';
import { ConcoursService } from './services/concours/concours.service';
import { DrawingsService } from './services/drawings/drawings.service';
import { EditorService } from './services/editor/editor.service';
import { Interceptor } from './services/http/interceptor';
import { LeaderboardService } from './services/leaderboard/leaderboard.service';
import { LoginService } from './services/login/login.service';
import { ReturnService } from './services/return/return.service';
import { SocketService } from './services/socket/socket.service';
import { UserService } from './services/user/user.service';
import { UsersService } from './services/users/users.service';

registerLocaleData(localeFr, 'fr');

@NgModule({
    declarations: [
        ChatUserBubbleComponent,
        ChatOthersBubbleComponent,
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        ColorComponent,
        ColorHueSliderComponent,
        ColorPickerComponent,
        ColorPaletteComponent,
        ColorHexComponent,
        ColorSwatchComponent,
        ColorAlphaSliderComponent,
        ConfirmationDialogComponent,
        SelectionComponent,
        SidebarPropertiesComponent,
        TopbarComponent,
        ChatComponent,
        ChatButtonComponent,
        SignInComponent,
        SignUpComponent,
        LoginComponent,
        ProfileComponent,
        EditInfoComponent,
        ChatRoomComponent,
        ChatCanauxComponent,
        CanalComponent,
        CreateCanalComponent,
        AlbumsDeDessinsComponent,
        AlbumComponent,
        CreateAlbumComponent,
        AlbumNotificationComponent,
        AlbumDrawingsComponent,
        CreateDrawingComponent,
        AlbumDrawingComponent,
        LayersListComponent,
        EditAvatarComponent,
        ImageCropperComponent,
        LoginHistoryComponent,
        DrawingPasswordComponent,
        EditAlbumComponent,
        EditDrawingComponent,
        ExpositionComponent,
        DessinsPageComponent,
        ConcoursPageComponent,
        ConcoursWeekComponent,
        WinnerComponent,
        EntriesPageComponent,
        EntryComponent,
        LeaderboardPageComponent,
        LeaderboardComponent,
        LeaderboardWinnerComponent,
        ActiveUsersComponent,
        SoumissionPageComponent,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        OverlayModule,
        MatCarouselModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatDialogModule,
        MatGridListModule,
        MatListModule,
        HttpClientModule,
        CommonModule,
        ImageCropperModule,
        NgxFileDropModule,
        ScrollingModule,
        MatSlideToggleModule,
        MatCarouselModule,
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        LoginService,
        SocketService,
        HttpService,
        ToolsInfoService,
        ChangingToolsService,
        KeyEventService,
        ToolsBoxService,
        CommandsService,
        SnackBarService,
        TextService,
        UserService,
        ChatService,
        ReturnService,
        CanauxService,
        AvatarService,
        ChatHandlerService,
        AlbumService,
        DrawingsService,
        EditorService,
        ConcoursService,
        LeaderboardService,
        UsersService,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(public loginService: LoginService, public socketService: SocketService) {}
}
