import { useState, useCallback } from 'react'

interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

interface ConfirmationState {
  isOpen: boolean
  options: ConfirmationOptions | null
  onConfirm: (() => void) | null
  resolve: ((value: boolean) => void) | null
}

export const useConfirmation = () => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    options: null,
    onConfirm: null,
    resolve: null
  })

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
        onConfirm: () => {
          resolve(true)
          setState({ isOpen: false, options: null, onConfirm: null, resolve: null })
        }
      })
    })
  }, [])

  const close = useCallback(() => {
    setState(prevState => {
      if (prevState.resolve) {
        prevState.resolve(false)
      }
      return { isOpen: false, options: null, onConfirm: null, resolve: null }
    })
  }, [])

  return {
    isOpen: state.isOpen,
    options: state.options,
    onConfirm: state.onConfirm,
    confirm,
    close
  }
}

export default useConfirmation