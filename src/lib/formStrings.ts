/**
 * Refund-form UI + HubSpot ticket strings, ported from the WordPress plugin
 * (Refund_HubSpot_V2::strings). Client-safe (no server imports) so the same
 * table drives the multi-step form UI and the server-side ticket text.
 *
 * The active language is chosen by NEXT_PUBLIC_FORM_LANG (see getFormStrings).
 */

export type FormLang =
  | "en" | "fr" | "es" | "pt" | "sr" | "me" | "bg" | "lv" | "sl" | "fi" | "ro";

export interface FormStrings {
  label: string;
  step1: string; step2: string; step3: string;
  phone_label: string; phone_tip: string;
  email_label: string; email_tip: string;
  iban_label: string; iban_tip: string;
  invoice_label: string; invoice_tip: string;
  file_hint: string; choose: string; no_file: string; view: string;
  comments_label: string;
  certif: string; cgu: string; privacy: string;
  next: string; prev: string; submit: string; sending: string;
  ok: string; err: string;
  err_required: string; err_email: string; err_size: string; err_type: string; err_consent: string;
  subject_prefix: string; note_body: string;
}

export const FORM_STRINGS: Record<FormLang, FormStrings> = {
  en: {
    label: "English",
    step1: "Your identity", step2: "Your documents", step3: "Request refund",
    phone_label: "Phone number", phone_tip: "Your phone number is required to locate the transaction and issue the refund to the correct line",
    email_label: "Email", email_tip: "Your email address is required to notify you once you have been refunded",
    iban_label: "Bank details (IBAN)", iban_tip: "Your IBAN is required so we can transfer your refund",
    invoice_label: "Upload the invoice", invoice_tip: "Max: 5MB (jpg, png or pdf) — add a screenshot of the operator's invoice showing the date, time and amount charged",
    file_hint: "Max: 5MB (jpg, png or pdf)", choose: "Choose file", no_file: "No file chosen", view: "View",
    comments_label: "Comments field",
    certif: "I certify that I have not requested a refund for this transaction from the operators. A refund can only be granted once; any further request may be penalised.",
    cgu: "I accept the website's Terms and Conditions (T&C) and the Personal Data Protection Policy.",
    privacy: "Your data is protected. You can click «Request refund» with complete confidence.",
    next: "Next", prev: "Previous", submit: "Request refund", sending: "Sending…",
    ok: "Your refund request has been submitted successfully.",
    err: "Something went wrong. Please try again.",
    err_required: "Please fill in all required fields.",
    err_email: "Please enter a valid email address.",
    err_size: "File is too large (max 5MB).",
    err_type: "Allowed file types: PDF, JPG, PNG.",
    err_consent: "Please tick both boxes to continue.",
    subject_prefix: "Refund", note_body: "Documents submitted via the refund form (invoice / IBAN).",
  },
  fr: {
    label: "Français",
    step1: "Votre identité", step2: "Vos documents", step3: "Demander le remboursement",
    phone_label: "Numéro de téléphone", phone_tip: "Votre numéro de téléphone est nécessaire pour retrouver la transaction et effectuer le remboursement sur la bonne ligne",
    email_label: "E-mail", email_tip: "Votre adresse e-mail est nécessaire pour vous informer que vous avez été remboursé(e)",
    iban_label: "Coordonnées bancaires (IBAN)", iban_tip: "Votre IBAN est nécessaire pour que nous puissions effectuer le virement de votre remboursement",
    invoice_label: "Téléverser la facture", invoice_tip: "Max : 5 Mo (jpg, png ou pdf) — ajoutez une capture d'écran de la facture de l'opérateur indiquant la date, l'heure et le montant facturé",
    file_hint: "Max : 5 Mo (jpg, png ou pdf)", choose: "Choisir un fichier", no_file: "Aucun fichier choisi", view: "Voir",
    comments_label: "Champ de commentaires",
    certif: "Je certifie ne pas avoir demandé le remboursement de cette transaction auprès des opérateurs. Un remboursement ne peut être accordé qu'une seule fois ; toute autre demande pourra être sanctionnée.",
    cgu: "J'accepte les Conditions Générales d'Utilisation (CGU) du site et la Politique de Protection des Données Personnelles.",
    privacy: "Vos données sont protégées. Vous pouvez cliquer sur « Demander le remboursement » en toute confiance.",
    next: "Suivant", prev: "Précédent", submit: "Demander le remboursement", sending: "Envoi…",
    ok: "Votre demande de remboursement a bien été envoyée.",
    err: "Une erreur est survenue. Veuillez réessayer.",
    err_required: "Veuillez remplir tous les champs obligatoires.",
    err_email: "Veuillez saisir une adresse e-mail valide.",
    err_size: "Fichier trop volumineux (max 5 Mo).",
    err_type: "Types de fichiers autorisés : PDF, JPG, PNG.",
    err_consent: "Veuillez cocher les deux cases pour continuer.",
    subject_prefix: "Remboursement", note_body: "Documents soumis via le formulaire de remboursement (facture / IBAN).",
  },
  es: {
    label: "Español",
    step1: "Su identidad", step2: "Sus documentos", step3: "Solicitar reembolso",
    phone_label: "Número de teléfono", phone_tip: "Su número de teléfono es necesario para localizar la transacción y efectuar el reembolso en la línea correcta",
    email_label: "Correo electrónico", email_tip: "Su dirección de correo electrónico es necesaria para informarle de que se le ha reembolsado",
    iban_label: "Datos bancarios (IBAN)", iban_tip: "Su IBAN es necesario para que podamos realizar la transferencia de su reembolso",
    invoice_label: "Subir la factura", invoice_tip: "Máx: 5MB (jpg, png o pdf) — añada una captura de pantalla de la factura del operador que muestre la fecha, la hora y el importe cobrado",
    file_hint: "Máx: 5MB (jpg, png o pdf)", choose: "Elegir archivo", no_file: "Ningún archivo seleccionado", view: "Ver",
    comments_label: "Campo de comentarios",
    certif: "Certifico que no he solicitado el reembolso de esta transacción a los operadores. Un reembolso solo puede concederse una vez; cualquier otra solicitud podrá ser sancionada.",
    cgu: "Acepto los Términos y Condiciones (CGU) del sitio y la Política de Protección de Datos Personales.",
    privacy: "Sus datos están protegidos. Puede hacer clic en «Solicitar reembolso» con total confianza.",
    next: "Siguiente", prev: "Anterior", submit: "Solicitar reembolso", sending: "Enviando…",
    ok: "Su solicitud de reembolso se ha enviado correctamente.",
    err: "Algo salió mal. Inténtelo de nuevo.",
    err_required: "Por favor, rellene todos los campos obligatorios.",
    err_email: "Por favor, introduzca un correo electrónico válido.",
    err_size: "El archivo es demasiado grande (máx 5MB).",
    err_type: "Tipos de archivo permitidos: PDF, JPG, PNG.",
    err_consent: "Marque ambas casillas para continuar.",
    subject_prefix: "Reembolso", note_body: "Documentos enviados a través del formulario de reembolso (factura / IBAN).",
  },
  pt: {
    label: "Português",
    step1: "A sua identidade", step2: "Os seus documentos", step3: "Solicitar reembolso",
    phone_label: "Número de telefone", phone_tip: "O seu número de telefone é necessário para encontrar a transação e efetuar o reembolso na linha correta",
    email_label: "E-mail", email_tip: "O seu endereço de e-mail é necessário para o/a informar de que foi reembolsado/a",
    iban_label: "Dados bancários (IBAN)", iban_tip: "O seu IBAN é necessário para que possamos efetuar a transferência do seu reembolso",
    invoice_label: "Carregar a fatura", invoice_tip: "Máx: 5MB (jpg, png ou pdf) — adicione uma captura de ecrã da fatura do operador mostrando a data, a hora e o montante cobrado",
    file_hint: "Máx: 5MB (jpg, png ou pdf)", choose: "Escolher ficheiro", no_file: "Nenhum ficheiro escolhido", view: "Ver",
    comments_label: "Campo de comentários",
    certif: "Certifico que não solicitei o reembolso desta transação junto dos operadores. Um reembolso só pode ser concedido uma única vez; qualquer outro pedido poderá ser sancionado.",
    cgu: "Aceito os Termos e Condições (CGU) do site e a Política de Proteção de Dados Pessoais.",
    privacy: "Os seus dados estão protegidos. Pode clicar em «Solicitar reembolso» com total confiança.",
    next: "Seguinte", prev: "Anterior", submit: "Solicitar reembolso", sending: "A enviar…",
    ok: "O seu pedido de reembolso foi enviado com sucesso.",
    err: "Ocorreu um erro. Tente novamente.",
    err_required: "Preencha todos os campos obrigatórios.",
    err_email: "Introduza um endereço de e-mail válido.",
    err_size: "Ficheiro demasiado grande (máx 5MB).",
    err_type: "Tipos de ficheiro permitidos: PDF, JPG, PNG.",
    err_consent: "Assinale ambas as caixas para continuar.",
    subject_prefix: "Reembolso", note_body: "Documentos enviados através do formulário de reembolso (fatura / IBAN).",
  },
  sr: {
    label: "Srpski",
    step1: "Vaš identitet", step2: "Vaši dokumenti", step3: "Zahtev za povraćaj",
    phone_label: "Broj telefona", phone_tip: "Vaš broj telefona je potreban da bismo pronašli transakciju i izvršili povraćaj na ispravan broj",
    email_label: "E-pošta", email_tip: "Vaša e-adresa je potrebna da bismo vas obavestili da je povraćaj izvršen",
    iban_label: "Bankovni podaci (IBAN)", iban_tip: "Vaš IBAN je potreban da bismo mogli da izvršimo prenos vašeg povraćaja",
    invoice_label: "Otpremite račun", invoice_tip: "Maks: 5MB (jpg, png ili pdf) — dodajte snimak ekrana računa operatera na kojem se vide datum, vreme i naplaćeni iznos",
    file_hint: "Maks: 5MB (jpg, png ili pdf)", choose: "Izaberite datoteku", no_file: "Nije izabrana datoteka", view: "Prikaži",
    comments_label: "Polje za komentare",
    certif: "Potvrđujem da nisam zatražio/la povraćaj ove transakcije od operatera. Povraćaj se može odobriti samo jednom; svaki dodatni zahtev može biti sankcionisan.",
    cgu: "Prihvatam Uslove korišćenja (CGU) sajta i Politiku zaštite ličnih podataka.",
    privacy: "Vaši podaci su zaštićeni. Možete sa punim poverenjem kliknuti na «Zahtev za povraćaj».",
    next: "Dalje", prev: "Nazad", submit: "Zahtev za povraćaj", sending: "Slanje…",
    ok: "Vaš zahtev za povraćaj je uspešno poslat.",
    err: "Došlo je do greške. Pokušajte ponovo.",
    err_required: "Popunite sva obavezna polja.",
    err_email: "Unesite važeću e-adresu.",
    err_size: "Datoteka je prevelika (maks 5MB).",
    err_type: "Dozvoljeni tipovi datoteka: PDF, JPG, PNG.",
    err_consent: "Označite oba polja da biste nastavili.",
    subject_prefix: "Povraćaj", note_body: "Dokumenti poslati putem obrasca za povraćaj (račun / IBAN).",
  },
  me: {
    label: "Crnogorski",
    step1: "Vaš identitet", step2: "Vaši dokumenti", step3: "Zahtjev za povraćaj",
    phone_label: "Broj telefona", phone_tip: "Vaš broj telefona je potreban da bismo pronašli transakciju i izvršili povraćaj na ispravan broj",
    email_label: "E-pošta", email_tip: "Vaša e-adresa je potrebna da bismo vas obavijestili da je povraćaj izvršen",
    iban_label: "Bankovni podaci (IBAN)", iban_tip: "Vaš IBAN je potreban da bismo mogli izvršiti prenos vašeg povraćaja",
    invoice_label: "Otpremite račun", invoice_tip: "Maks: 5MB (jpg, png ili pdf) — dodajte snimak ekrana računa operatera na kojem se vide datum, vrijeme i naplaćeni iznos",
    file_hint: "Maks: 5MB (jpg, png ili pdf)", choose: "Izaberite datoteku", no_file: "Nije izabrana datoteka", view: "Prikaži",
    comments_label: "Polje za komentare",
    certif: "Potvrđujem da nijesam zatražio/la povraćaj ove transakcije od operatera. Povraćaj se može odobriti samo jednom; svaki dodatni zahtjev može biti sankcionisan.",
    cgu: "Prihvatam Uslove korišćenja (CGU) sajta i Politiku zaštite ličnih podataka.",
    privacy: "Vaši podaci su zaštićeni. Možete s punim povjerenjem kliknuti na «Zahtjev za povraćaj».",
    next: "Dalje", prev: "Nazad", submit: "Zahtjev za povraćaj", sending: "Slanje…",
    ok: "Vaš zahtjev za povraćaj je uspješno poslat.",
    err: "Došlo je do greške. Pokušajte ponovo.",
    err_required: "Popunite sva obavezna polja.",
    err_email: "Unesite važeću e-adresu.",
    err_size: "Datoteka je prevelika (maks 5MB).",
    err_type: "Dozvoljeni tipovi datoteka: PDF, JPG, PNG.",
    err_consent: "Označite oba polja da biste nastavili.",
    subject_prefix: "Povraćaj", note_body: "Dokumenti poslati putem obrasca za povraćaj (račun / IBAN).",
  },
  bg: {
    label: "Български",
    step1: "Вашата самоличност", step2: "Вашите документи", step3: "Заявка за възстановяване",
    phone_label: "Телефонен номер", phone_tip: "Вашият телефонен номер е необходим, за да открием транзакцията и да извършим възстановяването по правилния номер",
    email_label: "Имейл", email_tip: "Вашият имейл адрес е необходим, за да ви уведомим, че сумата е възстановена",
    iban_label: "Банкови данни (IBAN)", iban_tip: "Вашият IBAN е необходим, за да можем да преведем възстановената сума",
    invoice_label: "Качете фактурата", invoice_tip: "Макс: 5MB (jpg, png или pdf) — добавете екранна снимка на фактурата на оператора, показваща датата, часа и таксуваната сума",
    file_hint: "Макс: 5MB (jpg, png или pdf)", choose: "Изберете файл", no_file: "Няма избран файл", view: "Преглед",
    comments_label: "Поле за коментари",
    certif: "Удостоверявам, че не съм заявявал/а възстановяване на тази транзакция от операторите. Възстановяване може да бъде предоставено само веднъж; всяка друга заявка може да бъде санкционирана.",
    cgu: "Приемам Общите условия (CGU) на сайта и Политиката за защита на личните данни.",
    privacy: "Вашите данни са защитени. Можете да щракнете върху «Заявка за възстановяване» с пълно доверие.",
    next: "Напред", prev: "Назад", submit: "Заявка за възстановяване", sending: "Изпращане…",
    ok: "Вашата заявка за възстановяване беше изпратена успешно.",
    err: "Възникна грешка. Моля, опитайте отново.",
    err_required: "Моля, попълнете всички задължителни полета.",
    err_email: "Моля, въведете валиден имейл адрес.",
    err_size: "Файлът е твърде голям (макс 5MB).",
    err_type: "Разрешени типове файлове: PDF, JPG, PNG.",
    err_consent: "Моля, отметнете двете полета, за да продължите.",
    subject_prefix: "Възстановяване", note_body: "Документи, изпратени чрез формуляра за възстановяване (фактура / IBAN).",
  },
  lv: {
    label: "Latviešu",
    step1: "Jūsu identitāte", step2: "Jūsu dokumenti", step3: "Pieprasīt atmaksu",
    phone_label: "Tālruņa numurs", phone_tip: "Jūsu tālruņa numurs ir nepieciešams, lai atrastu darījumu un veiktu atmaksu uz pareizo numuru",
    email_label: "E-pasts", email_tip: "Jūsu e-pasta adrese ir nepieciešama, lai jūs informētu, ka atmaksa ir veikta",
    iban_label: "Bankas dati (IBAN)", iban_tip: "Jūsu IBAN ir nepieciešams, lai mēs varētu veikt jūsu atmaksas pārskaitījumu",
    invoice_label: "Augšupielādējiet rēķinu", invoice_tip: "Maks.: 5MB (jpg, png vai pdf) — pievienojiet operatora rēķina ekrānuzņēmumu, kurā redzams datums, laiks un iekasētā summa",
    file_hint: "Maks.: 5MB (jpg, png vai pdf)", choose: "Izvēlēties failu", no_file: "Nav izvēlēts fails", view: "Skatīt",
    comments_label: "Komentāru lauks",
    certif: "Apliecinu, ka neesmu pieprasījis/usi šī darījuma atmaksu no operatoriem. Atmaksu var piešķirt tikai vienu reizi; par jebkuru citu pieprasījumu var tikt piemērotas sankcijas.",
    cgu: "Es piekrītu vietnes lietošanas noteikumiem (CGU) un personas datu aizsardzības politikai.",
    privacy: "Jūsu dati ir aizsargāti. Jūs varat ar pilnu pārliecību noklikšķināt uz «Pieprasīt atmaksu».",
    next: "Tālāk", prev: "Atpakaļ", submit: "Pieprasīt atmaksu", sending: "Nosūta…",
    ok: "Jūsu atmaksas pieprasījums ir veiksmīgi nosūtīts.",
    err: "Radās kļūda. Lūdzu, mēģiniet vēlreiz.",
    err_required: "Lūdzu, aizpildiet visus obligātos laukus.",
    err_email: "Lūdzu, ievadiet derīgu e-pasta adresi.",
    err_size: "Fails ir pārāk liels (maks. 5MB).",
    err_type: "Atļautie failu tipi: PDF, JPG, PNG.",
    err_consent: "Lūdzu, atzīmējiet abas izvēles rūtiņas, lai turpinātu.",
    subject_prefix: "Atmaksa", note_body: "Dokumenti iesniegti, izmantojot atmaksas veidlapu (rēķins / IBAN).",
  },
  sl: {
    label: "Slovenščina",
    step1: "Vaša identiteta", step2: "Vaši dokumenti", step3: "Zahtevaj vračilo",
    phone_label: "Telefonska številka", phone_tip: "Vaša telefonska številka je potrebna, da poiščemo transakcijo in izvedemo vračilo na pravo številko",
    email_label: "E-pošta", email_tip: "Vaš e-poštni naslov je potreben, da vas obvestimo, da je bilo vračilo izvedeno",
    iban_label: "Bančni podatki (IBAN)", iban_tip: "Vaš IBAN je potreben, da lahko izvedemo nakazilo vašega vračila",
    invoice_label: "Naložite račun", invoice_tip: "Najv.: 5MB (jpg, png ali pdf) — dodajte posnetek zaslona operaterjevega računa, na katerem so prikazani datum, ura in zaračunani znesek",
    file_hint: "Najv.: 5MB (jpg, png ali pdf)", choose: "Izberite datoteko", no_file: "Nobena datoteka ni izbrana", view: "Ogled",
    comments_label: "Polje za komentarje",
    certif: "Potrjujem, da pri operaterjih nisem zahteval/a vračila za to transakcijo. Vračilo je mogoče odobriti samo enkrat; vsaka nadaljnja zahteva je lahko sankcionirana.",
    cgu: "Sprejemam pogoje uporabe (CGU) spletnega mesta in politiko varstva osebnih podatkov.",
    privacy: "Vaši podatki so zaščiteni. S polnim zaupanjem lahko kliknete «Zahtevaj vračilo».",
    next: "Naprej", prev: "Nazaj", submit: "Zahtevaj vračilo", sending: "Pošiljanje…",
    ok: "Vaša zahteva za vračilo je bila uspešno poslana.",
    err: "Prišlo je do napake. Poskusite znova.",
    err_required: "Izpolnite vsa obvezna polja.",
    err_email: "Vnesite veljaven e-poštni naslov.",
    err_size: "Datoteka je prevelika (najv. 5MB).",
    err_type: "Dovoljene vrste datotek: PDF, JPG, PNG.",
    err_consent: "Za nadaljevanje označite obe polji.",
    subject_prefix: "Vračilo", note_body: "Dokumenti, poslani prek obrazca za vračilo (račun / IBAN).",
  },
  fi: {
    label: "Suomi",
    step1: "Henkilöllisyytesi", step2: "Asiakirjasi", step3: "Pyydä hyvitystä",
    phone_label: "Puhelinnumero", phone_tip: "Puhelinnumerosi tarvitaan tapahtuman löytämiseksi ja hyvityksen tekemiseksi oikealle numerolle",
    email_label: "Sähköposti", email_tip: "Sähköpostiosoitettasi tarvitaan, jotta voimme ilmoittaa sinulle hyvityksen suorittamisesta",
    iban_label: "Pankkitiedot (IBAN)", iban_tip: "IBAN-tilinumerosi tarvitaan, jotta voimme suorittaa hyvityksen tilisiirron",
    invoice_label: "Lataa lasku", invoice_tip: "Enint.: 5MB (jpg, png tai pdf) — lisää kuvakaappaus operaattorin laskusta, jossa näkyvät päivämäärä, kellonaika ja veloitettu summa",
    file_hint: "Enint.: 5MB (jpg, png tai pdf)", choose: "Valitse tiedosto", no_file: "Ei valittua tiedostoa", view: "Näytä",
    comments_label: "Kommenttikenttä",
    certif: "Vakuutan, etten ole pyytänyt hyvitystä tästä tapahtumasta operaattoreilta. Hyvitys voidaan myöntää vain kerran; muut pyynnöt voivat johtaa seuraamuksiin.",
    cgu: "Hyväksyn sivuston käyttöehdot (CGU) ja henkilötietojen suojakäytännön.",
    privacy: "Tietosi ovat suojattuja. Voit napsauttaa «Pyydä hyvitystä» täysin luottavaisin mielin.",
    next: "Seuraava", prev: "Edellinen", submit: "Pyydä hyvitystä", sending: "Lähetetään…",
    ok: "Hyvityspyyntösi on lähetetty onnistuneesti.",
    err: "Jokin meni pieleen. Yritä uudelleen.",
    err_required: "Täytä kaikki pakolliset kentät.",
    err_email: "Anna kelvollinen sähköpostiosoite.",
    err_size: "Tiedosto on liian suuri (enint. 5MB).",
    err_type: "Sallitut tiedostotyypit: PDF, JPG, PNG.",
    err_consent: "Valitse molemmat ruudut jatkaaksesi.",
    subject_prefix: "Hyvitys", note_body: "Hyvityslomakkeen kautta lähetetyt asiakirjat (lasku / IBAN).",
  },
  ro: {
    label: "Română",
    step1: "Identitatea dvs.", step2: "Documentele dvs.", step3: "Solicitați rambursarea",
    phone_label: "Număr de telefon", phone_tip: "Numărul dvs. de telefon este necesar pentru a găsi tranzacția și a efectua rambursarea pe numărul corect",
    email_label: "E-mail", email_tip: "Adresa dvs. de e-mail este necesară pentru a vă informa că ați fost rambursat(ă)",
    iban_label: "Date bancare (IBAN)", iban_tip: "IBAN-ul dvs. este necesar pentru a putea efectua transferul rambursării",
    invoice_label: "Încărcați factura", invoice_tip: "Max: 5MB (jpg, png sau pdf) — adăugați o captură de ecran a facturii operatorului care arată data, ora și suma percepută",
    file_hint: "Max: 5MB (jpg, png sau pdf)", choose: "Alegeți fișierul", no_file: "Niciun fișier ales", view: "Vizualizați",
    comments_label: "Câmp de comentarii",
    certif: "Certific că nu am solicitat rambursarea acestei tranzacții de la operatori. O rambursare poate fi acordată o singură dată; orice altă solicitare poate fi sancționată.",
    cgu: "Accept Termenii și condițiile (CGU) ale site-ului și Politica de protecție a datelor personale.",
    privacy: "Datele dvs. sunt protejate. Puteți face clic pe «Solicitați rambursarea» cu deplină încredere.",
    next: "Înainte", prev: "Înapoi", submit: "Solicitați rambursarea", sending: "Se trimite…",
    ok: "Cererea dvs. de rambursare a fost trimisă cu succes.",
    err: "A apărut o eroare. Vă rugăm să încercați din nou.",
    err_required: "Vă rugăm să completați toate câmpurile obligatorii.",
    err_email: "Vă rugăm să introduceți o adresă de e-mail validă.",
    err_size: "Fișierul este prea mare (max 5MB).",
    err_type: "Tipuri de fișiere permise: PDF, JPG, PNG.",
    err_consent: "Vă rugăm să bifați ambele căsuțe pentru a continua.",
    subject_prefix: "Rambursare", note_body: "Documente trimise prin formularul de rambursare (factură / IBAN).",
  },
};

export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png"] as const;
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function normalizeLang(input?: string): FormLang {
  const v = (input || "").toLowerCase();
  return (Object.keys(FORM_STRINGS) as FormLang[]).includes(v as FormLang)
    ? (v as FormLang)
    : "en";
}

/**
 * Language from NEXT_PUBLIC_FORM_LANG (build-time fallback). Prefer reading
 * `content.meta.formLang` per site; this env path is kept for compatibility.
 * Guarded so it's safe if bundled into the Workers runtime (no `process`).
 */
export function getFormLang(): FormLang {
  const fromEnv =
    typeof process !== "undefined" ? process.env?.NEXT_PUBLIC_FORM_LANG : undefined;
  return normalizeLang(fromEnv);
}

export function getFormStrings(lang?: FormLang): FormStrings {
  return FORM_STRINGS[lang ?? getFormLang()];
}
