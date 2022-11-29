import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.scss'],
  // providers: [EventoService] //uma das formas de injetar o services. Foi deixado descomentando a opcao do app.modules
})
export class EventosComponent implements OnInit {

  ngOnInit(): void {

  }
}
