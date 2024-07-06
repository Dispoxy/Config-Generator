$(document).ready(function() {
    // Load Google Fonts dynamically
    const googleFonts = ['Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Oswald'];
    googleFonts.forEach(font => {
        $('#fontFamily').append(new Option(font, font));
    });

    let bannerCount = 0;
    let customPageCount = 0;
    let ignoreAuthWarning = false;

    function generateKey(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const cryptoObj = window.crypto || window.msCrypto; // for IE 11
        const randomValues = new Uint32Array(length);
        cryptoObj.getRandomValues(randomValues);
        for (let i = 0; i < length; i++) {
            result += characters.charAt(randomValues[i] % characters.length);
        }
        return result;
    }

    $('#accessKey').val(generateKey(32));

    $('#rotateAccessKey').click(function() {
        $('#accessKey').val(generateKey(32));
    });

    $('#authWarningIgnore').click(function() {
        ignoreAuthWarning = true;
        $('#generateConfig').trigger('click');
    });

    $('#authWarningPrimary').click(function() {
        $('#authWarning').modal('hide');
        $('html, body').animate({
            scrollTop: $('#accessKey').offset().top
        }, 200, function() {
            $('#accessKey').focus();
        });
    });

    $('#addBanner').click(function() {
        bannerCount++;
        const bannerHtml = `
            <div class="mb-3 border p-3" id="banner-${bannerCount}">
                <h5>Banner ${bannerCount}</h5>
                <button type="button" class="btn btn-danger mb-2 removeBanner">Remove</button>
                <div class="mb-3">
                    <label for="bannerText-${bannerCount}" class="form-label">Banner Text</label>
                    <input type="text" class="form-control" id="bannerText-${bannerCount}" name="banners[${bannerCount}][text]" required>
                </div>
                <div class="mb-3">
                    <label for="bannerImage-${bannerCount}" class="form-label">Banner Image URL</label>
                    <input type="text" class="form-control" id="bannerImage-${bannerCount}" name="banners[${bannerCount}][image]" required>
                </div>
                <div class="mb-3">
                    <label for="bannerLogo-${bannerCount}" class="form-label">Banner Logo URL</label>
                    <input type="text" class="form-control" id="bannerLogo-${bannerCount}" name="banners[${bannerCount}][logo]" required>
                </div>
                <div class="mb-3">
                    <label for="bannerBgColor-${bannerCount}" class="form-label">Background Color</label>
                    <input type="color" class="form-control form-control-color" id="bannerBgColor-${bannerCount}" name="banners[${bannerCount}][bgColor]" value="#ffffff">
                </div>
                <div class="mb-3 form-check">
                    <input type="checkbox" class="form-check-input" id="bannerShadow-${bannerCount}" name="banners[${bannerCount}][shadow]">
                    <label class="form-check-label" for="bannerShadow-${bannerCount}">Shadow</label>
                </div>
            </div>`;
        $('#banners').append(bannerHtml);
    });

    $('#banners').on('click', '.removeBanner', function() {
        $(this).closest('.border').remove();
    });

    $('#addCustomPage').click(function() {
        customPageCount++;
        const customPageHtml = `
            <div class="mb-3 border p-3" id="customPage-${customPageCount}">
                <h5>Custom Page ${customPageCount}</h5>
                <button type="button" class="btn btn-danger mb-2 removeCustomPage">Remove</button>
                <div class="mb-3">
                    <label for="customPageTitle-${customPageCount}" class="form-label">Page Title</label>
                    <input type="text" class="form-control" id="customPageTitle-${customPageCount}" name="customPages[${customPageCount}][title]" required>
                </div>
                <div class="mb-3">
                    <label for="customPageContent-${customPageCount}" class="form-label">Page Content</label>
                    <textarea class="form-control" id="customPageContent-${customPageCount}" name="customPages[${customPageCount}][content]" rows="5" required></textarea>
                </div>
            </div>`;
        $('#customPages').append(customPageHtml);
    });

    $('#customPages').on('click', '.removeCustomPage', function() {
        $(this).closest('.border').remove();
    });

    $('#screenSaver').change(function() {
        var isEnabled = $(this).is(':checked');
        $('#screenSaverUrl, #screenSaverTimeout').prop('disabled', !isEnabled);
    });

    $('#generateConfig').click(function() {
        if (!$('#accessKey').val().trim() && !(ignoreAuthWarning)) {
            $('#authWarning').modal('show');
            return;
        }
        const config = {};
        $('#configForm').serializeArray().forEach(field => {
            const keys = field.name.match(/([^\[\]]+)/g);
            if (keys.length === 1) {
                config[keys[0]] = field.value;
            } else {
                if (!config[keys[0]]) config[keys[0]] = {};
                if (keys.length === 2) {
                    config[keys[0]][keys[1]] = field.value;
                } else {
                    if (!config[keys[0]][keys[1]]) config[keys[0]][keys[1]] = {};
                    config[keys[0]][keys[1]][keys[2]] = field.value;
                }
            }
        });
        var configJSON = JSON.stringify(config, null, 2);
        $('#output').html(configJSON.replace(/("accessKey":\s*")([^"]+)(")/, '$1<span class="spoiler">$2</span>$3'));
        $('#output').on('click', '.spoiler', function() {
            $(this).toggleClass('revealed');
        });
        $('#exportConfig').prop('disabled', false);
    });

    $('#exportConfig').click(function() {
        const config = $('#output').text();
        if (config) {
            const blob = new Blob([config], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'dispoxy-config.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            $('#exportConfig').prop('disabled', true);
        }
    });
});
