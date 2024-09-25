from django import forms

class RegisterUser(forms.Form):
    username=forms.CharField(
        label="",
        widget=forms.TextInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "Username",
                "required": True
            }
        )
    )

    email=forms.EmailField(
        label="",
        widget=forms.EmailInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "Email",
                "required": True
            }
        )
    )

    password=forms.CharField(
        label="",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "password",
                "required": True
            }
        )
    )

    confirmation=forms.CharField(
        label="",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "Confirm Password",
                "required": True
            }
        )
    )

class LoginUser(forms.Form):
    username=forms.CharField(
        label="",
        widget=forms.TextInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "Username",
                "required": True
            }
        )
    )

    password=forms.CharField(
        label="",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control mb03",
                "placeholder": "password",
                "required": True
            }
        )
    )