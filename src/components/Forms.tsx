import { useMemo } from "react"
import { UseFormReturn, Path, FieldValues, Controller, FieldPath } from "react-hook-form"

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
  required,
  initialValue
} : { 
  form: UseFormReturn<T>
  name: keyof T
  label: string
  placeholder?: string
  required?: boolean
  initialValue?: string
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
        defaultValue={initialValue}
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

export const FormSelect = <T extends FieldValues, Option,>({ 
  form,
  name,
  label,
  required,
  options,
  asString,
  placeholder
} : { 
  form: UseFormReturn<T>
  name: keyof T
  label: string
  required?: boolean
  initialValue?: string
  options: Option[]
  asString: (option: Option) => string,
  placeholder: string
}) => {
  return (
    <div className="flex flex-col">
      <label
        className="text-gray-600 text-sm pl-2" 
      >
        { label } { required && '*' }
      </label>
      <Controller
        name={name as FieldPath<T>}
        control={form.control}
        rules={{ required }}
        render={({ field: { onChange } }) => (
          <NativeSelect options={options} onSelect={onChange} asString={asString} placeholder={placeholder} />
        )}
      />
    </div>
  )
}

export const NativeSelect = <T,>({ options, asString, onSelect, placeholder } : { 
  options: T[], 
  asString: (option: T) => string 
  onSelect: (option: T) => void,
  placeholder: string
}) => {
  const optionMap = useMemo(() => new Map(options.map(option => [asString(option), option])), options)
  return (
    <div>
      <select className="p-2 bg-gray-50 text-gray-600 hover:cursor-pointer rounded-lg" onChange={e => onSelect(optionMap.get(e.target.value)!)}>
        <option disabled selected>{placeholder}</option>
        { Array.from(optionMap.keys()).map(key => (
          <option value={key}>{ key }</option>
        )) }
      </select>
    </div>
  )
}