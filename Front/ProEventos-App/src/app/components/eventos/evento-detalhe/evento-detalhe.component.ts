import { environment } from './../../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AbstractControl } from '@angular/forms';
import { Lote } from './../../../models/Lote';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { LoteService } from '@app/services/lote.service';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
})
export class EventoDetalheComponent implements OnInit {
  modalRef: BsModalRef;
  form!: FormGroup;
  eventoId: number;
  evento = {} as Evento;
  estadoSalvar: string = 'post';
  loteAtual = {id: 0, nome:'', indice:0};
  imagemURL = '../../../../assets/upoload.png';
  file: File;

  get modoEditar(): boolean {
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray{
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false,
    };
  }

  get bsConfigLote(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY',
      containerClass: 'theme-default',
      showWeekNumbers: false,
    };
  }

  constructor(
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private activatedRouter: ActivatedRoute,
    private eventoService: EventoService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private router: Router,
    private loteService: LoteService,
    private modalService: BsModalService
  ) {
    this.localeService.use('pt-br');
  }

  public carregarEvento(): void {
    this.eventoId = +this.activatedRouter.snapshot.paramMap.get('id');

    if (this.eventoId  !== null && this.eventoId !== 0) {
      this.spinner.show();

      this.estadoSalvar = 'put';

      this.eventoService.getEventoById(this.eventoId).subscribe(
        (evento: Evento) => {
          this.evento = {...evento};
          this.form.patchValue(this.evento);
          if(this.evento.imagemURL !== ''){
            this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
          }
          this.evento.lotes.forEach(lote => {
            this.lotes.push(this.criarLote(lote));
          });
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar carregar Evento', 'Erro!');
          console.error(error);
        },
      ).add(() => this.spinner.hide());
    }
  }

  ngOnInit(): void {
    this.carregarEvento();
    this.validation();
  }

  public validation(): void {
    this.form = this.fb.group({
      tema: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: [''],
      lotes: this.fb.array([]),
    });
  }

  adicionarLote(): void {
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  criarLote(lote: Lote): FormGroup {
    return this.fb.group({
      id: [lote.id],
      nome: [lote.nome, Validators.required],
      quantidade: [lote.quantidade, Validators.required],
      preco: [lote.preco, Validators.required],
      dataInicio: [lote.dataInicio],
      dataFim: [lote.dataFim],
    });
  }

  retornaTituloLote(nome: string) : string {
    return (nome === null || nome === '') ? 'Nome do Lote' : nome;
  }

  resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return { 'is-invalid': campoForm.errors && campoForm.touched };
  }

  public salvarEvento(): void {
    this.spinner.show();
    if(this.form.valid){

      this.evento = (this.estadoSalvar === 'post')
                ? {...this.form.value}
                : {id: this.evento.id, ...this.form.value};

      this.eventoService[this.estadoSalvar](this.evento).subscribe(
        (eventoRetorno: Evento) => {
          this.toastr.success('Evento salvo com sucesso!', 'Sucesso');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          console.error(error);
          this.spinner.hide();
          this.toastr.error('Erro ao salvar o evento.', 'Erro');
        },
        () => this.spinner.hide(),
      );
    }
  }

  public salvarLotes(): void {
    if(this.form.controls.lotes.valid) {
      this.spinner.show();
      this.loteService.saveLote(this.eventoId, this.form.value.lotes)
      .subscribe(
        () => {
          this.toastr.success('Lotes salvos com Sucesso!', 'Sucesso!');
          // this.lotes.reset();
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar salvar lotes!', 'Erro!');
          console.error(error);
        }
      )
      .add(() => this.spinner.hide());
      this.spinner.hide();
    }
  }

  public removerLote(template: TemplateRef<any>, indice: number): void {
    this.loteAtual.id = this.lotes.get(indice + '.id').value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome').value;
    this.loteAtual.indice = indice;

    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  public confirmDeleteLote() : void {
    this.modalRef.hide();
    this.spinner.show();

    this.loteService.deleteLote(this.eventoId, this.loteAtual.id)
      .subscribe(
        () => {
          this.toastr.success('Lote deletado com sucesso', 'Sucesso');
          this.lotes.removeAt(this.loteAtual.indice);
        },
        (error: any) => {
          this.toastr.error(`Erro ao tentar deletar lote ${this.loteAtual.id}`, 'Erro');
          console.error(error);
        }
      ).add(() => this.spinner.hide());
  }

  public declineDeleteLote() : void {
    this.modalRef.hide();
  }

  onFileChange(evento: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = evento.target.files[0];
    reader.readAsDataURL(this.file);

    this.uploadImagem();
  }

  uploadImagem(): void {
    this.spinner.show();
    this.eventoService.postUpload(this.eventoId, this.file).subscribe(
      () => {
        this.carregarEvento();
        this.toastr.success('Imagem carregada com sucesso.', 'Sucesso!');
      },
      (error: any) => {
        this.toastr.error(`Erro ao carregar imagem`, 'Erro!');
        console.error(error);
      }
    ).add(() => this.spinner.hide());;
  }

}
