import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import * as Yup from "yup";

import api from "~/services/api";
import history from "~/services/history";

import { FormContainer, FormLoading, Input, Select } from "~/components/Form";
import { HeaderForm } from "~/components/ActionHeader";

import { SelectContainer } from "./styles";

const schema = Yup.object().shape({
  product: Yup.string().required("O producto da entrega é obrigatório"),
  deliveryman_id: Yup.number().required("Selecione um entregador"),
  recipient_id: Yup.number().required("Selecione um entregador")
});

export default function OrderForm({ match }) {
  const { id } = match.params;

  const [order, setOrder] = useState({});
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState([]);
  const [deliverymans, setDeliverymans] = useState([]);
  const [selectedDeliveryman, setSelectedDeliveryman] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line no-inner-declarations
      async function loadOrderDetails() {
        try {
          setLoading(true);

          const response = await api.get(`/orders/${id}`);

          setOrder(response.data);
          setSelectedRecipient(response.data.recipient);
          setSelectedDeliveryman(response.data.deliveryman);

          setLoading(false);
        } catch (err) {
          toast.error("Falha ao carregar dados");
        }
      }

      loadOrderDetails();
    }
  }, [id]);

  useEffect(() => {
    async function loadSelectOptions() {
      try {
        const [recipientResponse, deliverymanResponse] = await Promise.all([
          api.get("recipients"),
          api.get("deliverymans")
        ]);

        setRecipients(recipientResponse.data);
        setDeliverymans(deliverymanResponse.data);
      } catch (err) {
        toast.error("Falha ao carregar dados");
      }
    }

    loadSelectOptions();
  }, []);

  const recipientsOptions = recipients.map(recipient => {
    const data = {
      value: recipient.id,
      label: recipient.name
    };

    return data;
  });

  const handleChangeRecipient = selectedOption => {
    const { value } = selectedOption;

    setSelectedRecipient(value);
  };

  const deliverymansOptions = deliverymans.map(deliveryman => {
    const data = {
      value: deliveryman.id,
      label: deliveryman.name
    };

    return data;
  });

  const handleChangeDeliveryman = selectedOption => {
    const { value } = selectedOption;

    setSelectedDeliveryman(value);
  };

  async function handleSubmit({ product, deliveryman_id, recipient_id }) {
    try {
      deliveryman_id = selectedDeliveryman;
      recipient_id = selectedRecipient;

      const data = { product, deliveryman_id, recipient_id };

      if (id) {
        await api.put(`/orders/${id}`, data);
      }

      if (!id) {
        await api.post("orders", data);
      }

      toast.success("Encomenda salva com sucesso");
      history.push("/orders");
    } catch (err) {
      toast.error("Algo deu errado ao salvar a encomenda");
    }
  }

  return (
    <>
      {loading ? (
        <FormLoading />
      ) : (
        <FormContainer
          initialData={order}
          onSubmit={handleSubmit}
          schema={schema}
        >
          <HeaderForm id={id} prevPage="/orders" title="encomendas" />

          <section>
            <SelectContainer>
              <Select
                name="recipient.name"
                label="Destinatário"
                placeholder="Selecione um destinatário"
                options={recipientsOptions}
                defaultValue={{
                  value: selectedRecipient.id,
                  label: selectedRecipient.name
                }}
                onChange={handleChangeRecipient}
              />
              <Select
                name="deliveryman.name"
                label="Entregador"
                placeholder="Selecione um entregador"
                options={deliverymansOptions}
                defaultValue={{
                  value: selectedDeliveryman.id,
                  label: selectedDeliveryman.name
                }}
                onChange={handleChangeDeliveryman}
              />
            </SelectContainer>

            <Input
              name="product"
              label="Nome do produto"
              placeholder="Ex: iPhone"
            />
          </section>
        </FormContainer>
      )}
    </>
  );
}

OrderForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.node
    }).isRequired
  }).isRequired
};