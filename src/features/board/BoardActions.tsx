import { useRef } from "react"
import { useDispatch } from "react-redux"
import { getState, storeVersion } from "../.."
import { migrations } from "../../migrations"
import { addTextWidget, addTokenWidget, deserializeWidgets, selectSerializedWidgets } from "../widgets/widgetsSlice"
import styles from "./BoardActions.module.css"
import { deserializeBoard, selectSerializedBoard, updateBackgroundImage } from "./boardSlice"


const reader = new FileReader()
let fileReaderFinished: () => any = () => undefined
reader.addEventListener("load", () => fileReaderFinished())

export function BoardActions() {

    const imageInput = useRef<HTMLInputElement>(null)
    const importInput = useRef<HTMLInputElement>(null)
    const dispatch = useDispatch()

    fileReaderFinished = () => {
        if (reader.result) {
            dispatch(updateBackgroundImage(reader.result.toString()))
        }
    }


    function onLoadImageClicked() {
        if (imageInput.current) {
            imageInput.current.click()
        }
    }

    function onLoadImageFinished(e: React.ChangeEvent) { 
        if (e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
            reader.readAsDataURL(e.target.files[0])
        }
    }

    function onAddTokenClicked() {
        dispatch(addTokenWidget(100, 100, 64, 64))
    }

    function onAddTextClicked() {
        dispatch(addTextWidget(100, 100, 128, 32))
    }


    function onClickExport() {
        const state =  getState()
        const serialized = JSON.stringify({
            version: storeVersion,
            board: selectSerializedBoard(state),
            widgets: selectSerializedWidgets(state),
        })

        let a = document.createElement("a");
        a.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(serialized))
        a.setAttribute("download", "board.dinosaurio")
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    function onClickImport() {
        if (importInput.current) {
            importInput.current.click()
        }
    }

    async function onLoadImportFinished(e: React.ChangeEvent) {
        if (e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
            const text =  await e.target.files[0].text()
            const serialized = JSON.parse(text)

            if (!serialized.version) {
                // TODO! error
            }
            while (serialized.version < storeVersion) {
                let oldVersion = serialized.version
                migrations[serialized.version](serialized)
                if (oldVersion === serialized.version) {
                    // TODO! error
                    break
                }
            }
            
            // TODO! validation
            dispatch(deserializeBoard(serialized.board))
            dispatch(deserializeWidgets(serialized.widgets))
        }
    }

    return (
        <div className={styles.actions}>
            <input type="file" ref={imageInput} accept=".jpg, .jpeg, .png" onChange={onLoadImageFinished} />
            <button type="button" onClick={onLoadImageClicked}>Load Image</button>
            <button type="button" onClick={onAddTokenClicked}>Add Token</button>
            <button type="button" onClick={onAddTextClicked}>Add Text</button>
            <button type="button" onClick={onClickExport}>Export</button>
            <input type="file" 
                ref={importInput}
                id="import-file-selector" 
                accept=".dinosaurio" 
                onChange={onLoadImportFinished}
            />
            <button type="button" onClick={onClickImport}>Import</button>
            <select>
                <option>Option 1</option>
                <option>Option 2</option>
            </select>
            <button style={{padding: "3px 6px 3px 9px"}}>
                Add
                <span className="material-icons">arrow_drop_down</span>
            </button>
        </div>
    )
}
