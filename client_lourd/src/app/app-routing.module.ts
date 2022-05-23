import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat/chat.component';
import { EditorComponent } from '@app/components/editor/editor.component';
import { MainPageComponent } from '@app/components/main-page/main-page.component';
import { ProfileComponent } from '@app/components/profile/profile.component';
import { SignInComponent } from '@app/components/sign-in/sign-in.component';
import { SignUpComponent } from '@app/components/sign-up/sign-up.component';
import { AlbumDrawingsComponent } from './components/album/album-drawings/album-drawings.component';
import { AlbumsDeDessinsComponent } from './components/album/albums-de-dessins/albums-de-dessins.component';
import { ConcoursPageComponent } from './components/concours/concours-page/concours-page.component';
import { EntriesPageComponent } from './components/concours/entries-page/entries-page.component';
import { SoumissionPageComponent } from './components/concours/soumission-page/soumission-page.component';
import { DessinsPageComponent } from './components/dessins/dessins-page/dessins-page.component';
import { LeaderboardPageComponent } from './components/leaderboard/leaderboard-page/leaderboard-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },

    { path: 'home', component: MainPageComponent },
    { path: 'editor/:id', component: EditorComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'signin', component: SignInComponent },
    { path: 'signup', component: SignUpComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'albums', component: AlbumsDeDessinsComponent },
    { path: 'album/:id', component: AlbumDrawingsComponent },
    { path: 'dessins', component: DessinsPageComponent },
    { path: 'dessins/:filter', component: DessinsPageComponent },
    { path: 'concours', component: ConcoursPageComponent },
    { path: 'entries', component: EntriesPageComponent },
    { path: 'submissions', component: SoumissionPageComponent },
    { path: 'leaderboard', component: LeaderboardPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
