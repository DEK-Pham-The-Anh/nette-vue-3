<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;


/**
 * Base presenter for all application presenters.
 */
abstract class BasePresenter extends Nette\Application\UI\Presenter
{
    public function renderDefault(): void
    {
        $vue_manifest_path = $_SERVER['DOCUMENT_ROOT'] . '\vue-development\src\manifest.json';

        if (file_exists($vue_manifest_path)) {
            $this->template->manifest_vue = Nette\Utils\Json::decode(file_get_contents($vue_manifest_path), 1);
        }
    }
}
