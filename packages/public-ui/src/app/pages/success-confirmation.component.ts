import { Component } from '@angular/core';

@Component({
    selector: 'app-confirmation-success',
    template: `
        <div class="overlay">
            <div class="modal">
                <div class="modal-content">
                    <p>
                        {{ content }}
                        <a href="/dashboard">{{ linkText }}</a>
                        {{ subContent }}
                    </p>
                </div>
            </div>
        </div>
    `,
})
export class ConfirmationSuccessComponent {
    public content = `Congratulations, Your driver's license has been renewed. `;

    public linkText = 'click here ';

    public subContent = 'to return to the Home page ';
}
