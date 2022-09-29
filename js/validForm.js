let collectionsForms = {};
$(function () {
    let forms = $('.validate-form');
    forms.each(function (index, htmlForm) {
        collectionsForms[index] = new formValid(htmlForm);
    })

})

class formValid {

    constructor(form) {
        this.form = form;
        this.JqForm = $(this.form);
        this.form.valid = false;
        this.arrayRequiredInputs = [];
        this.form.formSubmit = this.JqForm.find("input[type=submit]");
        this.Ajax = this.JqForm.attr('data-custom-ajax');

        let $this = this
        //собираем все input required
        this.JqForm.find("input[type=text][required], input[type=email][required], input[type=password][required], input[type=date][required]").each(function (indexObj, element){
            let input = new inputForm(element);
            $this.arrayRequiredInputs.push({input});
        })
        //собираем textarea
        this.JqForm.find("textarea[required]").each(function (indexObj, element){
            let input = new textareaForm(element);
            $this.arrayRequiredInputs.push({input});
        })
        //собираем select
        this.JqForm.find("select[required]").each(function (indexObj, element){
            let input = new selectForm(element);
            $this.arrayRequiredInputs.push({input});
        })
        //собираем checkbox
        this.JqForm.find(".valid-checkbox-multiple").each(function (indexObj, element){
            let input = new checkboxForm(element);
            $this.arrayRequiredInputs.push({input});
        })
        //добавляем события на форму
        this.addEventsBeforeSubmit($this);
    }
    addEventsBeforeSubmit($this){
        $(this.form.formSubmit).on({
            click: function (event) {
                if ($this.checkValidateForm($this)) {
                    return true;
                } else {
                    return false;
                }
            }
        })
        $($this.form).submit( function (event) {
            // event.preventDefault()
            if ($this.checkValidateForm($this)) {
                return true;
            } else {
                return false;
            }
        })
    }
    validTextarea(objTiny) {
        this.getInputById(objTiny.id).checkValue();
    }
    validInputJq(input) {
        this.getInputById(input.attr('id')).checkValue();
    }
    getInputById(idInput) {
        let result = {};
        this.arrayRequiredInputs.forEach(function (item) {
            if (item.input.input.id === idInput) {
                result = item.input;
            }
        })
        return result;
    }
    checkValidateForm($this) {
        // проверка полей
        Object.keys($this.arrayRequiredInputs).forEach(keyInput => {
            $this.arrayRequiredInputs[keyInput].input.valid = $this.arrayRequiredInputs[keyInput].input.checkValue();
        })
        // проверка всей формы
        let result = Object.keys($this.arrayRequiredInputs).every(key => {
            return $this.arrayRequiredInputs[key].input.valid === true;
        })
        $this.form.valid = result;

        return result;
    }
}
class inputForm {
    constructor(input) {
        this.input = input;
        this.jqTargetError = $('#'+$(input).attr('data-error-target'));
        let $this = this;
        this.addEventsInputs($this);
    }
    addEventsInputs($this) {
        $(this.input).on({
            change: function () {
                $this.checkValue(this);
            },
            focusout: function () {
                $this.checkValue(this);
            }
        })
    }
    checkValue() {
        if ($(this.input).val() !== "") {
            this.closeError(this.input);
            return true;
        } else {
            this.showError(this.input);
            return false;
        }
    }
    showError() {
        this.jqTargetError.addClass('active');
        $(this.input).addClass("error-input");
    }
    closeError() {
        this.jqTargetError.removeClass('active');
        $(this.input).removeClass("error-input");
    }
}

class textareaForm extends inputForm{
    checkValue() {
        //tinyMCE находиться в компоненте редактора
        let idEdit = tinyMCE.get(this.input.id);
        let content = idEdit.getContent();
        let input = $("#"+ idEdit.id);
        if (content === '') {
            this.showError();
            return false;
        } else {
            this.closeError();
            return true;
        }
    }
}

class selectForm extends inputForm {
    checkValue() {
        let iValue = $(this.input).val();
        if (iValue !== null) {
            this.closeError(this.input);
            return true;
        } else {
            this.showError(this.input);
            return false;
        }
    }
    showError() {
        this.jqTargetError.addClass('active');
        let wrapError = $(this.input).siblings(".new-select");
        if (wrapError.length > 0) {
            wrapError.addClass("error-input");
        }
    }
    closeError() {
        this.jqTargetError.removeClass('active');
        let wrapError = $(this.input).siblings(".new-select");
        if (wrapError.length > 0) {
            wrapError.removeClass("error-input");
        }
    }
}

class checkboxForm extends inputForm {
    constructor(input) {
        super();
        this.input = input;
        this.Jqimput = $(this.input);
        this.jqTargetError = $('#'+$(input).attr('data-error-target'));
        let $this = this;
        $this.group = this.Jqimput.find("input[type=checkbox]");
        this.addEventsInputs($this);
    }
    addEventsInputs($this) {
        $($this.group).on({
            change: function () {
               $this.checkValue(this);
            },
        })
    }
    checkValue() {
        let result = Object.keys(this.group).some(key => {
            return this.group[key].checked;
        })
        if (result) {
            this.closeError(this.input);
            return true;
        } else {
            this.showError(this.input);
            return false;
        }
    }
    updateInputGroup($this) {
        $this.group = $this.Jqimput.find("input[type=checkbox]");
        $this.addEventsInputs($this);
    }
    showError() {
        this.jqTargetError.addClass('active');
        if ($(this.input).attr('data-error-wraper')) {
            let wrapError = $(this.input).attr('data-error-wraper');
            $("#" + wrapError).addClass("error-input");
        }
    }
    closeError() {
        this.jqTargetError.removeClass('active');
        if ($(this.input).attr('data-error-wraper')) {
            let wrapError = $(this.input).attr('data-error-wraper');
            $("#" + wrapError).removeClass("error-input");
        }
    }
}

