import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list';
import { UserCreateComponent } from './pages/user-create/user-create';
import { UserDetailComponent } from './pages/user-detail/user-detail';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { Profile } from './pages/profile/profile';
import { ProfileEdit } from './pages/profile-edit/profile-edit';
import { RegisterComponent } from './pages/register/register';
import { CampaignList } from './pages/campaign-list/campaign-list';
import { CampaignDetail } from './pages/campaign-detail/campaign-detail';
import { CampaignPlay } from './pages/campaign-play/campaign-play';
import { CampaignCreate } from './pages/campaign-create/campaign-create';
import { CampaignEdit } from './pages/campaign-edit/campaign-edit';
import { FriendsHub } from './pages/friends-hub/friends-hub'; 
import { PublicProfile } from './pages/public-profile/public-profile';

// Importación de los guardias
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },

  { path: 'perfil', component: Profile, canActivate: [authGuard] },
  { path: 'perfil/editar', component: ProfileEdit, canActivate: [authGuard] },

  { path: 'amigos', component: FriendsHub, canActivate: [authGuard] },

  { path: 'perfil-publico/:id', component: PublicProfile, canActivate: [authGuard] },

  {
    path: 'campanas',
    children: [
      { path: '', component: CampaignList },
      { path: 'crear', component: CampaignCreate },
      { path: 'editar/:id', component: CampaignEdit },
      { path: ':id', component: CampaignDetail },
      { path: ':id/jugar', component: CampaignPlay }
    ]
  },

  {
    path: 'usuarios',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', component: UserListComponent },
      { path: 'crear', component: UserCreateComponent },
      { path: ':id', component: UserDetailComponent }
    ]
  },

  { path: '**', redirectTo: 'inicio' },
];