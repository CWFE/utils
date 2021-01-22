import CustomImageEditor, { HandleFileBlob } from '.'

export default {
    editImage(src: string, callback: HandleFileBlob): void {
        console.log(callback)
        CustomImageEditor.newInstance(instance => {
            instance.setOnHandleFileBlob(callback)
            instance.editImage(src)
        })
    },
    endEdit(): void {
        CustomImageEditor.newInstance(instance => instance.endEdit())
    }
}