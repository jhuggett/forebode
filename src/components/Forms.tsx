import { UseFormReturn, Path, FieldValues } from "react-hook-form"

export const Checkbox = <T extends FieldValues,>({ 
  form,
  name,
  label,
  alreadyChecked,
  required 
} : { 
  form: UseFormReturn<T>
  name: keyof T
  label: string
  alreadyChecked?: boolean
  required?: boolean 
}) => {
  return (
    <div className="flex justify-between gap-1">
      <label
        htmlFor={name as string}
        className="text-gray-600 text-sm pl-2" 
      >
        { label } { required && '*' }
      </label>
      <input
        type="checkbox"
        id={name as string}
        checked={alreadyChecked}
        className=""
        {...form.register(name as Path<T>, { 
          required
        })}
      />
      
    </div>
  )
}

export const Text = <T extends FieldValues,>({ 
  form,
  name,
  label,
  placeholder,
  required 
} : { 
  form: UseFormReturn<T>
  name: keyof T
  label: string
  placeholder?: string
  required?: boolean 
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="email"
        className="text-gray-600 text-sm pl-2" 
      >
        { label } { required && '*' }
      </label>
      <input
        type="text"
        id={name as string}
        className="px-4 py-2 rounded-lg"
        placeholder={placeholder}
        {...form.register(name as Path<T>, { 
          required
        })}
      />
    </div>
  )
}

export const Email = <T extends { email: string },>({ 
  form, 
  required 
} : { 
  form: UseFormReturn<T>, 
  required?: boolean 
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="email"
        className="text-gray-600 text-sm pl-2" 
      >
        Email { required && '*' }
      </label>
      <input
        type="email"
        id="email"
        className="px-4 py-2 rounded-lg"
        placeholder="john@smith.com"
        {...form.register("email" as Path<T>, { 
          required
        })}
      />
    </div>
  )
}

export const Password = <T extends { password: string },>({ 
  form, 
  required 
} : { 
  form: UseFormReturn<T>, 
  required?: boolean 
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="password"
        className="text-gray-600 text-sm pl-2" 
      >
        Password { required && '*' }
      </label>
      <input
        type="password"
        id="password"
        className="px-4 py-2 rounded-lg"
        placeholder="•••"
        {...form.register("password" as Path<T>, { 
          required
        })}
      />
    </div>
  )
}

export const SubmitButton = ({ text }: { text?: string }) => {
  return (
    <div className='flex justify-end'>
      <button type="submit" className='bg-gray-500 w-fit text-gray-200 font-medium px-4 rounded-md py-1'>
        { text || 'Continue' }
      </button>
    </div>
  )
}