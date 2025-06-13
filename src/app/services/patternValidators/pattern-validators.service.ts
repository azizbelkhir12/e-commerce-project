import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class PatternValidatorsService {

  static patternValidators(regex :RegExp, error:ValidationErrors):ValidatorFn{
    return(control:AbstractControl): ValidationErrors | null =>{
      if(!control.value){
        // Si le contrôle est vide, renvoie null (aucune erreur)
        return null;
      }
      // Teste la valeur du contrôle avec l'expression régulière fournie
      const valid = regex.test(control.value);

      // Si c'est valide, renvoie null (pas d'erreur), sinon renvoie l'erreur spécifiée
      return valid? null:error;
    };
  }
}
