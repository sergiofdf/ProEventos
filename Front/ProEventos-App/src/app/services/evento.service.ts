import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Evento } from 'src/app/models/Evento';

@Injectable(
  //{providedIn: 'root'} //uma das formas de injetar o services. Foi deixado descomentando a opcao do app.modules
)
export class EventoService {
  baseUrl = 'https://localhost:5001/api/eventos';

constructor(private http: HttpClient) { }

public getEventos():Observable<Evento[]>{
  return this.http.get<Evento[]>(this.baseUrl);
}

public getEventosByTema(tema: string):Observable<Evento[]>{
  return this.http.get<Evento[]>(`${this.baseUrl}/${tema}/tema`);
}

public getEventoById(id: number):Observable<Evento>{
  return this.http.get<Evento>(`${this.baseUrl}/${id}`);
}

}
