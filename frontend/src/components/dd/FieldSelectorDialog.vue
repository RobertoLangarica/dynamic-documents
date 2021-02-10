<template>
  <q-dialog ref="dialog" full-height @before-show="onBeforeOpen" @before-hide="onBeforeClose">
    <q-card v-if="!invisible" class="q-dialog-plugin">
      <q-card-section class="col-auto">
        <span class="text-h6">{{ title }}</span>
      </q-card-section>
      <q-card-section class="col">
        <q-scroll-area class="full-height full-width">
          <q-list>
            <template v-for="(item, index) in items">
              <q-separator spaced v-if="index > 0 && item.group" :key="`space_${index}`" />
              <span :key="item.key">
                <q-item-label v-if="item.group" header>{{ item.name }}</q-item-label>
                <q-item v-else tag="label" v-ripple>
                  <q-checkbox v-model="item.selected" :label="item.name" />
                </q-item>
              </span>
            </template>
          </q-list>
        </q-scroll-area>
      </q-card-section>
      <q-card-actions align="right" class="col-auto">
        <q-btn flat rounded color="secondary" label="Cancelar" @click="onClose" />
        <q-btn rounded color="primary" label="Aceptar" @click="onSelect" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { QDialog } from 'quasar'
import { DDField } from 'src/dynamic-documents/src/core/DDField';

interface IFieldItem{
    name:string;
    group:boolean;
    field?:DDField;
    fields?:IFieldItem[];
    selected?:boolean;
    key:string;
}
@Component({})
export default class FieldSelectorDialog extends Vue {
    @Prop({ required: false, default: 'Elige un campo' }) readonly title!: string;
    @Prop({ required: true }) readonly fields!:DDField[]

    items:IFieldItem[] = []

    mounted () {
      this.sortFieldsInGroups()
    }

    sortFieldsInGroups () {
      let general:IFieldItem = { name: 'Generales', fields: [], group: true, key: 'general_group' }
      let groups:{[key:string] : IFieldItem;} = {}
      let sortedGroups:IFieldItem[] = []
      this.items = []

      this.fields.forEach(f => {
        if (DDField.isGroup(f)) {
          // the group could exists before this field since it is referenced by other fields
          if (!groups[f.id]) {
            groups[f.id] = { name: '', fields: [], group: true }
          }
          groups[f.id].name = f.name
          sortedGroups.push(groups[f.id])
        } else if (!f.group_by || f.group_by === '') {
          general.fields!.push({ name: f.name, field: f, group: false, selected: false, key: f.id })
        } else {
          let g = f.group_by

          if (!groups[g]) {
            groups[g] = { name: '', fields: [], group: true }
          }
          groups[g].fields!.push({ name: f.name, field: f, group: false, selected: false, key: f.id })
        }
      })

      // First the fields without group
      this.items.push(general)
        general.fields!.forEach(i => {
          this.items.push(i)
        })

        // Fields with group
        sortedGroups.forEach(i => {
          this.items.push(i)
            i.fields!.forEach(ii => {
              this.items.push(ii)
            })
        })
    }

    show () {
      (this.$refs.dialog as QDialog).show()
    }

    hide () {
      (this.$refs.dialog as QDialog).hide()
    }

    onSelect (selected) {
      selected = selected || this.items.filter(i => i.selected).map(f => f.field)
      this.$emit('ok', selected)
      this.hide()
    }

    onClose () {
      this.hide()
    }

    get invisible () {
    // @ts-ignore
      return this.$root.invisibleDialogs
    }

    onBeforeOpen () {
      if (this.invisible) {
        this.sortFieldsInGroups()
        this.$root.$on('complete_dialog_action', this.onSelect.bind(this))
        this.$root.$on('cancel_dialog_action', this.onClose.bind(this))
        this.$root.$emit('send_message',
          {
            message: 'opening_dialog',
            data: {
              type: 'FieldEmbedDialog',
              title: this.title,
              items: this.items
            }
          })
      }
    }

    onBeforeClose () {
      if (this.invisible) {
        this.$root.$off('complete_dialog_action')
        this.$root.$off('cancel_dialog_action')
      }
    }
}
</script>
