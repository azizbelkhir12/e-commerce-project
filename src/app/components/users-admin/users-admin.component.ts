import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-admin',
  templateUrl: './users-admin.component.html',
  styleUrls: ['./users-admin.component.css'],
})
export class UsersAdminComponent implements OnInit {
  users: any = [];
  isModalOpen = false;
  editingUser: any = null;

  editForm!: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userService.getUsers().subscribe((res) => {
      this.users = res;
    });

    this.editForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    });
  }

  deleteUser(id: any) {
    this.userService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter((user: { _id: any }) => user._id !== id);
    });
  }

  editUser(user: any) {
    this.editingUser = { ...user };
    this.editForm.patchValue({
      username: user.username,
      email: user.email,
      phone: user.phone,
    });
    this.isModalOpen = false;
  }

  cancelEdit(): void {
    this.isModalOpen = false;
    this.editForm.reset();
    this.editingUser = null;
  }

  saveUser(): void {
    if (this.editForm.valid && this.editingUser) {
      const updatedUser = {
        ...this.editingUser,
        ...this.editForm.value,
      };

      this.userService.editUser(updatedUser).subscribe(() => {
        this.userService.getUsers().subscribe((res) => {
          this.users = res;
          this.cancelEdit();
        });
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }
}
