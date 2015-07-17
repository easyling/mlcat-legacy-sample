<?php

/**
 * To run this, simply do: php -S localhost:8080
 * then navigate your browser to http://localhost:8080
 * Note: xliff parsing might experience problems, 100%
 * correct parsing of it was not a requirement to test
 * the functionality of the SlimView
 */

// Set your XLIFF file path here
$xlf = file_get_contents("xliffs/xliff.xlf");

class TranslationUnit {

    private $key;
    private $onPage;
    private $source;
    private $target;
    private $translationGroup = null;

    public function __construct($key, $onPage, $source, $target) {
        $this->key = $key;
        $this->onPage = $onPage;
        $this->source = $source;
        $this->target = $target;

        self::$byKey[$key] = $this;
    }

    /**
     * @param TranslationGroup $translationGroup
     */
    public function setTranslationGroup(TranslationGroup $translationGroup)
    {
        $this->translationGroup = $translationGroup;
        $this->translationGroup->addTranslationUnit($this);
    }

    /**
     * @return null
     */
    public function getTranslationGroup()
    {
        return $this->translationGroup;
    }

    public function hasTranslationGroup()
    {
        return $this->translationGroup !== null;
    }

    /**
     * @return string|null
     */
    public function getKey()
    {
        return $this->key;
    }

    /**
     * @return mixed
     */
    public function getTarget()
    {
        return $this->target;
    }

    /**
     * @return mixed
     */
    public function getPage()
    {
        return $this->onPage;
    }

    public function getTargetInternalFormat() {
        if($this->target == null || empty($this->target)) {
            return '';
        } else {
            $fragment = "<root>$this->target</root>";
            $fragmentXml = simplexml_load_string($fragment);
            $fragmentXmlString = '';
            if(count($fragmentXml->children()) > 0) {
                foreach($fragmentXml as $child) {
                    $fragmentXmlString .= (string)$child;
                }
            }
            return $fragmentXmlString;
//            return (string)$fragmentXml->children()[0];
        }
    }

    public static $byKey = [];

}

class TranslationGroup {

    /**
     * @var {TranslationUnit[]}
     */
    private $translationUnits = [];

    private $key;

    private $onPage;

    public function __construct($key, $onPage) {
        $this->key = $key;
        $this->onPage = $onPage;

        self::$byKey[$key] = $this;
    }

    public function addTranslationUnit(TranslationUnit $unit) {
        $this->translationUnits []= $unit;
    }

    public function getTranslationUnits() {
        return $this->translationUnits;
    }

    public function getPage() {
        return $this->onPage;
    }

    /**
     * @return mixed
     */
    public function getKey()
    {
        return $this->key;
    }

    public function getGroupTargetInternalFormat() {
        $xml = '';
        foreach($this->translationUnits as $unit) {
            $xml .= $unit->getTargetInternalFormat();
        }
        return htmlentities($xml);
    }

    public static $byKey = [];
}


class ExportDocument {

    private $sourceLanguage;
    private $targetLanguage;
    private $projectCode;

    public function __construct($source, $target, $projectCode) {
        $this->sourceLanguage = $source;
        $this->targetLanguage = $target;
        $this->projectCode = $projectCode;
    }

    /**
     * @return string
     */
    public function getSourceLanguage()
    {
        return $this->sourceLanguage;
    }

    /**
     * @return string
     */
    public function getTargetLanguage()
    {
        return $this->targetLanguage;
    }

    /**
     * @return string
     */
    public function getProjectCode()
    {
        return $this->projectCode;
    }

    public function processXliff(SimpleXMLElement $xliffBody) {
        if($this->hasGroups($xliffBody)) {
            $this->getGroupTranslationUnits($xliffBody);
            // segmented
        } else {
            // non-segmented
            $this->getTranslationUnits($xliffBody);
        }
    }

    private function hasGroups(SimpleXMLElement $xliffBody) {
        return count($xliffBody->xpath("./group")) > 0;
    }

    private function getGroupTranslationUnits(SimpleXMLElement $xliffBody) {
        foreach($xliffBody->xpath("./group") as $group) {
            $onPage = $group->attributes("xlink", true)["href"];
            $id = (string)$group->attributes()["id"];
            $transGroup = new TranslationGroup($id, $onPage);
            $this->getTranslationUnits($group, $transGroup);
        }
    }

    private function getTranslationUnits(SimpleXMLElement $xliffBody, TranslationGroup $group = null) {
        $transUnits = [];
        foreach($xliffBody->xpath("./trans-unit") as $transUnit) {
            $id = (string)$transUnit->attributes()["id"];
            $onPage = $group != null ? $group->getPage() : $transUnit->attributes("xlink", true)["href"];
            $sourceElement = $transUnit->xpath("./source")[0];
            if($sourceElement->count() > 0) {
                if($group != null) {
                    $source = '';
                    $domSourceElement = dom_import_simplexml($sourceElement);
                    $counter = 0;
                    for($i = 0; $i < $domSourceElement->childNodes->length; ++$i) {
                        $child = $domSourceElement->childNodes->item($i);
                        if($child->nodeType == 1) {
                            $source .= $sourceElement->children()[$counter]->asXml();
                            $counter++;
                        } else {
                            $source .= $child->nodeValue;
                        }
                    }
                } else {
                    $source = $sourceElement->children()[0]->asXML();
                }
            } else {
                $source = (string)$sourceElement;
            }

            if($id == "gk3ezywk_613")
                var_dump($source);
            $targetElement = $transUnit->xpath("./target");

            $target = '';
            if($targetElement instanceof SimpleXMLElement || !empty($targetElement)) {
                if($targetElement[0]->count() > 0) {
                    if($group != null) {
                        $domTargetElement = dom_import_simplexml($targetElement[0]);
                        $counter = 0;
                        for($i = 0; $i < $domTargetElement->childNodes->length; ++$i) {
                            $child = $domTargetElement->childNodes->item($i);
                            if($child->nodeType == 1) {
                                $target .= $targetElement[0]->children()[$counter]->asXml();
                                $counter++;
                            } else {
                                $target .= $child->nodeValue;
                            }
                        }
                    } else {
                        $target = $targetElement[0]->children()[0]->asXml();
                    }
                } else {
                    $target = '';
                }
            }
            if($target == '')
                $target = $source;

            $newUnit = new TranslationUnit($id, $onPage, $source, $target);
            if($group !== null)
                $newUnit->setTranslationGroup($group);
            $transUnits []= $newUnit;
        }
        return $transUnits;
    }
}

header('Content-Type: text/html; charset=utf-8');

$xlf = str_replace('xmlns=', 'xmlns:x=', $xlf);
$xliff = simplexml_load_string($xlf);

$sourceLanguage = (string)$xliff->file->attributes()["source-language"];
$targetLanguage = (string)$xliff->file->attributes()["target-language"];
$projectCode = (string)$xliff->file->attributes()["original"];

$doc = new ExportDocument($sourceLanguage, $targetLanguage, $projectCode);
$doc->processXliff($xliff->xpath("//body")[0]);

$SEGMENTED = count(TranslationGroup::$byKey) > 0;
$groupDisplay = $SEGMENTED ? 'block' : 'none';
$jsSegmented = $SEGMENTED ? 'true' : 'false';
echo <<<EOT
<html>
<head>
    <style>
    label {
        border: 1px solid white;
        padding: 3px;
    }
    label.active {
        border: 1px solid red;
    }
    label > span {
        display: inline-block;
        width: 140px;
        overflow: hidden;
    }
    fieldset legend {
        display: block;
        max-width: 480px;
        overflow: hidden;
    }
    .selected-target,
    .selected-group-target {
        min-height: 100px;
    }
    .selected-target #target,
    .selected-group-target #group-target {
        border: 1px solid #CCC;
        min-height: 16px;
        font-family: monospace;
        line-height: 18px;
    }
    .selected-group-target {
        display: {$groupDisplay};
    }
    .selected-target #internal-target,
    .selected-target #target {
        display: block;
        width: 100%;
        height: 80px;
        overflow: hidden;
        overflow-y: auto;
    }

    </style>
    <script src="js/vendor/jquery-1.10.1.min.js"></script>
    <script>
        var exportInfo = {
            "projectCode": "{$doc->getProjectCode()}",
            "sourceLanguage": "{$doc->getSourceLanguage()}",
            "targetLanguage": "{$doc->getTargetLanguage()}"
        };
        var XLIFF = {
            "segmented": {$jsSegmented}
        };
    </script>
    <script src="js/utils.js"></script>
    <script src="js/entry-controller.js"></script>
    <script src="js/entry.js"></script>
    <script src="js/exceptions.js"></script>
    <script src="js/message-envelope.js"></script>
    <script src="js/slim-view.js"></script>
    <script src="slim-example.js"></script>
</head>
<body>
<header>
    ProjectCode: {$doc->getProjectCode()}<br />
    SourceLang: {$doc->getSourceLanguage()}<br />
    targetLang: {$doc->getTargetLanguage()}<br />
</header>
<button id="freeclick">Freeclick</button>
<div style="float: left;">
EOT;

$template = <<<EOT
<label style="display: block; margin-bottom: 4px;" data-key="{{KEY}}" data-page="{{PAGE}}" data-group-target="{{GROUPTARGET}}" data-internal-target="{{INTERNALTARGET}}">
    <span title="{{KEY}}">{{KEY}}</span>
    <input type="text" name="target" value="{{VAL}}" style="width: 350px;" class="target"/>
</label>
EOT;

function replaceUnitPlaceholders($tpl, $unit) {
    $tpl = str_replace("{{KEY}}", $unit->getKey(), $tpl);
    $tpl = str_replace("{{VAL}}", htmlspecialchars($unit->getTarget()), $tpl);
    $tpl = str_replace("{{PAGE}}", $unit->getPage(), $tpl);
    $tpl = str_replace("{{INTERNALTARGET}}", htmlspecialchars($unit->getTargetInternalFormat()), $tpl);
    if($unit->hasTranslationGroup()) {
        $tpl = str_replace("{{GROUPTARGET}}", $unit->getTranslationGroup()->getGroupTargetInternalFormat(), $tpl);
    }
    return $tpl;
}

if($SEGMENTED) {
    foreach(TranslationGroup::$byKey as $group) {
        echo "<fieldset><legend title=\"{$group->getKey()}\">{$group->getKey()}</legend>";

        foreach($group->getTranslationUnits() as $unit) {
            $tpl = $template;
            $tpl = replaceUnitPlaceholders($tpl, $unit);
            echo $tpl;
        }
        echo '</fieldset>';
    }
} else {
    foreach(TranslationUnit::$byKey as $unit) {
        $tpl = $template;
        $tpl = replaceUnitPlaceholders($tpl, $unit);
        echo $tpl;
    }
}


echo <<<EOT
</div>
<div style="float: left; width: 700px; margin-left: 10px; border-left: 1px solid gray; padding-left: 10px;" id="selected">
    Key: <span id="key"></span><br />
    Page: <span id="page"></span><br />
    <div class="selected-target">Export format target: <div id="target"></div></div>
    <div class="selected-target">Internal format target: <textarea id="internal-target"></textarea></div><button id="partial-update-button">Partial-friggin-update</button>
    <div class="selected-group-target">Group target: <div id="group-target"></div></div>
    <iframe id="embedSlimView" src="about:blank" style="width: 1024px; border: 1px solid black; height: 700px;">

    </iframe>
</div>
</body></html>
EOT;
