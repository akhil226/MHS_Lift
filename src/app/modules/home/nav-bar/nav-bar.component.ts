import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { UserDetails, UserPreAccess } from '../../login/login.interface';
import { AUTHKEY } from '../../shared/constants/auth.constant';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})

export class NavBarComponent implements OnInit {
  userPrivilage: UserPreAccess[] = this.user.getUserDetails()?.userPreAccess || [];
  isAdmin: boolean = this.user.getUserDetails()?.userType === AUTHKEY.ADMIN ? true : false || false;
  uiBVersion: UserDetails |any= this.user.getUserDetails()?.uiBVersion;
  version=environment.version;
  email='@mhslift.com';
  emailId:any;
  result:boolean | undefined;
//console.log(userPrivilage: any);


  constructor(
    private user: UserService
  ) { }

  ngOnInit(): void {
    const userDetails = this.user.getUserDetails();
    this.emailId=userDetails?.email || '';
     this.result = this.emailId.includes(this.email);
  }

}
