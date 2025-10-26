
import { useState, useEffect, useMemo, useCallback } from "react"

// We need a stable way to generate unique IDs for toasts.
let count = 0
function generateId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

// Action types for our reducer.
const ActionType = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

// Reducer to manage toast state. It's more predictable than setState with functions.
const reducer = (state, action) => {
  switch (action.type) {
    case ActionType.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case ActionType.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }
    case ActionType.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t
        ),
      }
    case ActionType.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
    default:
      return state
  }
}

const listeners = []
let memoryState = { toasts: [] }

function dispatch(action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// The toast function is now defined once and exported.
export const toast = (props) => {
  const id = generateId()

  const update = (props) =>
    dispatch({
      type: ActionType.UPDATE_TOAST,
      toast: { ...props, id },
    })

  const dismiss = () => dispatch({ type: ActionType.DISMISS_TOAST, toastId: id })

  dispatch({
    type: ActionType.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [state, setState] = useState(memoryState)

  useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  // This useEffect handles automatic dismissal of toasts.
  useEffect(() => {
    const timers = new Map()

    const anidados = state.toasts.map(toast => {
      if (toast.open && !timers.has(toast.id)) {
        const timer = setTimeout(() => {
          toast.onOpenChange?.(false)
          timers.delete(toast.id)
        }, toast.duration || 5000)
        timers.set(toast.id, timer)
      }
      return toast.id
    })

    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer)
      }
    }
  }, [state])

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId) => {
      dispatch({ type: ActionType.DISMISS_TOAST, toastId })
    },
  }
}
