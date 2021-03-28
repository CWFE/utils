import CustomImageEditor, { HandleFileBlob } from '.'

export default {
    editImage(src: string, callback: HandleFileBlob): void {
        CustomImageEditor.newInstance(instance => {
            instance.setOnHandleFileBlob(callback)
            instance.editImage(src)
        })
    },
    endEdit(): void {
        CustomImageEditor.newInstance(instance => instance.endEdit())
    }
}